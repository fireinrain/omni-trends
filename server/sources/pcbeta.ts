import type { RSSInfo } from "../types"
import { parseRSS } from "../utils/rss2json"

const baseUrl = "https://bbs.pcbeta.com"
const challengePath = "/__access_review"
const challengeCookieName = "access_env_challenge"
const environmentCookieName = "access_env_verified"
const reviewedCookieName = "access_reviewed"

// 论坛的无感校验和滑块校验都通过 cookie 记录，缓存起来避免每次请求都重复校验
let environmentCookie: string | undefined
let reviewedCookie: string | undefined
let authPromise: Promise<void> | undefined

function getSetCookies(headers: Headers): string[] {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie
  return typeof getSetCookie === "function" ? getSetCookie.call(headers) : []
}

function findCookie(lines: string[], name: string): string | undefined {
  for (const line of lines) {
    const pair = line.split(";", 1)[0]
    const index = pair.indexOf("=")
    if (index === -1) continue
    if (pair.slice(0, index).trim() !== name) continue
    const value = pair.slice(index + 1).trim()
    if (value) return `${name}=${value}`
  }
}

function cookieHeader(): string | undefined {
  const cookies = [environmentCookie, reviewedCookie].filter(Boolean)
  return cookies.length ? cookies.join("; ") : undefined
}

function isEnvironmentChallenge(body: string): boolean {
  return body.includes(challengePath) && !body.includes("data-challenge=")
}

function isSliderChallenge(body: string): boolean {
  return body.includes(challengePath) && body.includes("data-challenge=")
}

async function fetchText(url: string, cookie?: string) {
  let responseHeaders: Headers | undefined
  let status = 0
  const body = await myFetch(url, {
    responseType: "text",
    ignoreResponseError: true,
    headers: cookie ? { cookie } : undefined,
    onResponse: ({ response }) => {
      responseHeaders = response.headers
      status = response.status
    },
  }) as string
  return { body, headers: responseHeaders, status }
}

async function postChallenge(cookie: string | undefined, body: Record<string, string>) {
  let responseHeaders: Headers | undefined
  const result = await myFetch<{ ok?: boolean }>(`${baseUrl}${challengePath}`, {
    method: "POST",
    ignoreResponseError: true,
    headers: {
      ...(cookie ? { cookie } : {}),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
    responseType: "json",
    onResponse: ({ response }) => {
      responseHeaders = response.headers
    },
  })

  if (!result?.ok || !responseHeaders) throw new Error("pcbeta access review failed")
  return getSetCookies(responseHeaders)
}

async function solveEnvironmentChallenge(challengeCookie: string): Promise<string> {
  const cookies = await postChallenge(challengeCookie, {
    action: "environment",
    platform: "Win32",
    webdriver: "0",
    headless: "0",
    cdp: "0",
  })
  const verified = findCookie(cookies, environmentCookieName)
  if (!verified) throw new Error("pcbeta access review returned no cookie")
  return verified
}

async function solveSliderChallenge(url: string, body: string, cookie?: string): Promise<string> {
  const challenge = body.match(/data-challenge="([^"]+)"/)?.[1]
  const distance = body.match(/data-distance="([^"]+)"/)?.[1]
  if (!challenge || !distance) throw new Error("pcbeta slider challenge missing")

  const target = new URL(url)
  const cookies = await postChallenge(cookie, {
    action: "slide",
    distance,
    challenge,
    return_to: `${target.pathname}${target.search}`,
    client_platform: "Win32",
    screen_resolution: "1920x1080",
    webgl_vendor: "Google Inc. (NVIDIA)",
    webgl_renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
  })
  const reviewed = findCookie(cookies, reviewedCookieName)
  if (!reviewed) throw new Error("pcbeta slider review returned no cookie")
  return reviewed
}

async function authenticate(url: string): Promise<void> {
  if (authPromise) return authPromise

  authPromise = (async () => {
    environmentCookie = undefined
    reviewedCookie = undefined

    let response = await fetchText(url)
    if (isEnvironmentChallenge(response.body)) {
      if (!response.headers) throw new Error("pcbeta challenge response has no headers")
      const challengeCookie = findCookie(getSetCookies(response.headers), challengeCookieName)
      if (!challengeCookie) throw new Error("pcbeta challenge cookie missing")
      environmentCookie = await solveEnvironmentChallenge(challengeCookie)
      response = await fetchText(url, cookieHeader())
    }

    if (isSliderChallenge(response.body)) {
      reviewedCookie = await solveSliderChallenge(url, response.body, cookieHeader())
    }
  })().finally(() => {
    authPromise = undefined
  })

  return authPromise
}

async function fetchRss(url: string): Promise<RSSInfo> {
  let response = await fetchText(url, cookieHeader())

  if (isEnvironmentChallenge(response.body) || isSliderChallenge(response.body)) {
    await authenticate(url)
    response = await fetchText(url, cookieHeader())
  }

  if (response.status >= 400) {
    throw new Error(`pcbeta request failed (${response.status}): ${response.body.slice(0, 300)}`)
  }
  if (response.body.includes(challengePath)) throw new Error("pcbeta challenge not passed")
  return parseRSS(response.body)
}

function definePcbetaRSSSource(url: string) {
  return defineSource(async () => {
    const data = await fetchRss(url)
    if (!data.items.length) throw new Error("Cannot fetch rss data")
    return data.items.map(item => ({
      title: item.title,
      url: item.link,
      id: item.link,
      pubDate: item.created,
    }))
  })
}

export default defineSource({
  "pcbeta-windows11": definePcbetaRSSSource("https://bbs.pcbeta.com/forum.php?mod=rss&fid=563&auth=0"),
  "pcbeta-windows": definePcbetaRSSSource("https://bbs.pcbeta.com/forum.php?mod=rss&fid=521&auth=0"),
})

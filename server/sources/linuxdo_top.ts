export const LINUXDO_TOP_RSS_URL = "https://linuxdorss.longpink.com/top.xml"

/** LINUX DO 热门话题，使用第三方 RSS 镜像。 */
const linuxdoTop = defineRSSSource(LINUXDO_TOP_RSS_URL)

export default defineSource({
  "linuxdo-top": linuxdoTop,
})

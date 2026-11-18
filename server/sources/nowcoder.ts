interface Res {
  data: {
    result: {
      id: string
      title: string
      type: number
      uuid: string
    }[]
  }
}

export default defineSource(async () => {
  const timestamp = Date.now()
  const url = `https://gw-c.nowcoder.com/api/sparta/hot-search/top-hot-pc?size=20&_=${timestamp}&t=`
  const res: Res = await myFetch(url)
  return res.data.result
    .filter(k => k.type === 74 || k.type === 0)
    .map((k) => {
      const isFeed = k.type === 74
      return {
        id: isFeed ? k.uuid : k.id,
        title: k.title,
        url: isFeed
          ? `https://www.nowcoder.com/feed/main/detail/${k.uuid}`
          : `https://www.nowcoder.com/discuss/${k.id}`,
      }
    })
})

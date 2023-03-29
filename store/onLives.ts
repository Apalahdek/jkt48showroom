import JSONSerializer from '~~/library/serializer/json'

export const useOnLives = defineStore('onLives', () => {
  const { data: lives, pending, error, refresh, tryRefresh } = useLocalStoreController<IRoomLive[] | null>('onlives', {
    fetch: refreshLives,
    expiredIn: 10000,
    serializer: new JSONSerializer<IRoomLive[] | null>(null)
  })

  const livesMap = computed(() => {
    const map = new Map()
    if (!lives.value) return map
    for (const live of (lives.value ?? [])) {
      map.set(live.room_id, live)
    }
    return map
  })

  async function refreshLives (): Promise<IRoomLive[]> {
    return await $fetch('/api/showroom/now_live?_=' + new Date().getTime())
    // TODO remove this
    // const data = await $fetch('/api/showroom/onlives')
    // const re = (data.onlives[0]?.lives ?? []).splice(0, 3).map((i) => {
    //   return {
    //     name: i.main_name ?? 'Sule',
    //     img: i.image ?? 'https://static.showroom-live.com/image/room/cover/ee38ccf437e220f7ce8149c1c8aac94d6dca66734334bdad84c94bf41e78d3e0_square_s.png?v=1670924861',
    //     url: i.room_url_key ?? '',
    //     room_id: i.room_id ?? 0,
    //     is_graduate: false,
    //     is_group: false,
    //     room_exists: true,
    //     streaming_url_list: i.streaming_url_list ?? [],
    //     started_at: i.started_at * 1000
    //   }
    // })
    // return [...await $fetch('/api/showroom/now_live'), ...re]
  }

  function isLive (roomId: number) {
    return livesMap.value?.has(roomId)
  }

  return {
    data: lives,
    pending,
    error,
    tryRefresh,
    refresh,
    isLive
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnLives, import.meta.hot))
}

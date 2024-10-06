<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiFetch } from '~/composables/useApiFetch'
import { useI18n } from 'vue-i18n'
import { useResponsive } from '~/composables/useResponsive'

const route = useRoute()
const router = useRouter()
const page = ref<number>(Number(route.query.page) || 1)
const data = ref<IApiNews | null>(null)
const pending = ref<boolean>(false)
const error = ref<any>(null)

const { locale } = useI18n()

// Fetch data on mount
onMounted(async () => {
  try {
    pending.value = true
    const response = await useApiFetch<IApiNews>('/api/news', { params: { page: page.value } })
    data.value = response
  } catch (e) {
    error.value = e
  } finally {
    pending.value = false
  }
})

// Scroll to top when data is loading
watch(pending, (p) => {
  if (p) window.scrollTo({ top: 0 })
})

// Change page query
function changePage(p: number) {
  router.push({
    query: { page: String(p) },
  })
}

// Watch route query for page changes
watch(
  () => route.query.page,
  (newPage, oldPage) => {
    if (oldPage !== newPage) {
      page.value = !Number.isNaN(newPage) ? Number(newPage) : 1
    }
  }
)

const { greaterOrEqual } = useResponsive()
const isXl = greaterOrEqual('xl')
const maxDots = computed(() => (isXl.value ? 9 : 7))

</script>

<template>
  <LayoutRow title="News" :mobile-side="false">
    <template #default>
      <!-- Loading Skeleton -->
      <div v-if="pending" class="flex flex-col gap-3.5">
        <div v-for="num in 10" :key="num" class="bg-container mx-3 flex h-[106px] animate-pulse flex-col gap-2 rounded-xl p-3 md:mx-4 md:p-4" />
      </div>

      <!-- Error Message -->
      <div v-else-if="error">
        <Error :message="$t('error.unknown')" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
      </div>

      <!-- News List -->
      <div v-else-if="data" class="flex flex-col gap-3.5">
        <div v-for="news in data.news" :key="news.id" class="bg-container mx-3 flex flex-col gap-2 rounded-xl p-3 md:mx-4 md:p-4">
          <NuxtImg
            class="h-[19px] w-[56px] rounded-[3px]"
            :src="`${$cloudinaryURL}/assets/jkt48${news.label}`"
            alt="Label"
            loading="lazy"
            fit="fill"
            width="56px"
            format="webp"
          />
          <NuxtLink :to="`/news/${news.id}`" class="inline-block leading-5">
            {{ news.title }}
          </NuxtLink>
          <div class="text-sm font-light">
            {{ $dayjs(news.date).locale(locale).format("DD MMMM YYYY") }}
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <ClientOnly>
        <div v-if="!error" class="float-right m-3 min-w-[100px] max-w-[95vw] self-end md:m-4">
          <PulsePaginationControl v-if="pending || !data" :max-dots="maxDots" />
          <PaginationControl
            v-else
            key="pagination"
            class="justify-center sm:!left-auto"
            :page="data.page"
            :max-dots="maxDots"
            :total="Math.ceil(data.total_count / data.perpage)"
            @page-change="changePage"
          />
        </div>
      </ClientOnly>
    </template>
    
    <!-- Sidebar Content -->
    <template #sidebar>
      <HomeRecents class="mt-3 md:mt-4" />
    </template>
  </LayoutRow>
</template>

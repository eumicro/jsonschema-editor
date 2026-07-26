<script setup lang="ts">
import type { AppLocale, AppPage, AppStack } from "../../../app-routing";
import SiteFooter from "../molecules/SiteFooter.vue";
import SiteHero from "../molecules/SiteHero.vue";
import SiteTopbar from "../molecules/SiteTopbar.vue";

const locale = defineModel<AppLocale>("locale", { required: true });

defineProps<{
  ui: {
    brandPrefix: string;
    brandSuffix: string;
    topNavAria: string;
    navGetStarted: string;
    navExamples: string;
    navImprint: string;
    stackAria: string;
    localeLabel: string;
    tagline: string;
    subtitle: string;
    footerCopyright: string;
    footerImprint: string;
  };
  activePage: AppPage;
  ownedStack: AppStack;
  examplesHref: string;
  getStartedHref: string;
  imprintHref: string;
  vueHref: string;
  reactHref: string;
}>();

const emit = defineEmits<{
  openExamples: [];
  openGetStarted: [];
  openImprint: [];
  selectStack: [stack: AppStack];
}>();
</script>

<template>
  <div class="app">
    <SiteTopbar
      v-model:locale="locale"
      :ui="ui"
      :active-page="activePage"
      :owned-stack="ownedStack"
      :examples-href="examplesHref"
      :get-started-href="getStartedHref"
      :imprint-href="imprintHref"
      :vue-href="vueHref"
      :react-href="reactHref"
      @open-examples="emit('openExamples')"
      @open-get-started="emit('openGetStarted')"
      @open-imprint="emit('openImprint')"
      @select-stack="emit('selectStack', $event)"
    />
    <SiteHero :tagline="ui.tagline" :subtitle="ui.subtitle" />
    <slot />
    <SiteFooter
      :copyright="ui.footerCopyright"
      :imprint-label="ui.footerImprint"
      :imprint-href="imprintHref"
      :imprint-active="activePage === 'imprint'"
      @open-imprint="emit('openImprint')"
    />
  </div>
</template>

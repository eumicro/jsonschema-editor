<script setup lang="ts">
import type { AppLocale, AppPage, AppStack } from "../../../app-routing";
import BrandLink from "../atoms/BrandLink.vue";
import LocaleSelect from "../atoms/LocaleSelect.vue";
import NavLink from "../atoms/NavLink.vue";
import StackSwitch from "../atoms/StackSwitch.vue";

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
  <header class="app__topbar">
    <div class="app__topbar-start">
      <BrandLink
        :href="examplesHref"
        :brand-prefix="ui.brandPrefix"
        :brand-suffix="ui.brandSuffix"
        @navigate="emit('openExamples')"
      />
      <nav class="app__topnav" :aria-label="ui.topNavAria">
        <NavLink
          :href="getStartedHref"
          :active="activePage === 'get-started'"
          :label="ui.navGetStarted"
          @navigate="emit('openGetStarted')"
        />
        <NavLink
          :href="examplesHref"
          :active="activePage === 'examples'"
          :label="ui.navExamples"
          @navigate="emit('openExamples')"
        />
        <NavLink
          :href="imprintHref"
          :active="activePage === 'imprint'"
          :label="ui.navImprint"
          @navigate="emit('openImprint')"
        />
      </nav>
    </div>
    <div class="app__topbar-actions">
      <StackSwitch
        :switch-aria-label="ui.stackAria"
        :owned-stack="ownedStack"
        :vue-href="vueHref"
        :react-href="reactHref"
        @select="emit('selectStack', $event)"
      />
      <LocaleSelect v-model="locale" :label="ui.localeLabel" />
    </div>
  </header>
</template>

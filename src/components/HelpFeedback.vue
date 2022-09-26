<template>
  <q-dialog v-model="model">
    <q-card>
      <q-card-section class="row q-mb-none q-pb-none">
        <div class="text-h6">Help & Feedback</div>
        <q-space></q-space>
        <q-btn
          class="account-settings__close"
          icon="close"
          round
          dense
          color="warning"
          v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <p>
          We’re using
          <a href="https://github.com/coddicat/GooCollage/discussions" target="_blank">
            Github Discussions
          </a>
          as a place to connect with other members of our community. We hope
          that you:
          <ul>
            <li>Ask questions you're wondering about.</li>
            <li>Share ideas.</li>
            <li>Engage with other community members.</li>
            <li>Welcome others and are open-minded. Remember that this is a community we build together.</li>
        </ul>
        </p>
        <p>Visit our <a href="https://github.com/coddicat/GooCollage/wiki" target="_blank">GitHub Wiki</a> for documentation and answers to frequently asked questions</p>
        <p>
          Or send us
          <a href="mailto:goocollage@gmail.com" target="_blank">an Email goocollage@gmail.com</a>
        </p>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HelpFeedback',
  computed: {
    model: {
      get(): boolean {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  props: {
    modelValue: Boolean,
  },
});
</script>

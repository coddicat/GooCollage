<template>
  <q-dialog v-model="model">
    <q-card>
      <q-card-section class="row">
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
          If you have any questions or issues, please contact our
          <a href="https://github.com/coddicat/GooCollage/discussions"
            >Discussions</a
          >
          and
          <a href="https://github.com/coddicat/GooCollage/wiki">Wiki</a>
          for help, or send us
          <a href="mailto:coddicat@gmail.com">an Email</a>
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

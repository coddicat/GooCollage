<template>
  <q-card style="align-self: center" class="q-mt-lg q-mx-md">
    <q-card-section>
      <div class="q-mb-md" style="font-size: 20px">
        <q-icon name="warning" color="warning" size="md"></q-icon>
        The album requires a secret:
      </div>

      <q-input
        v-model="password"
        dense
        :type="isPwd ? 'password' : 'text'"
        label="Password"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
    </q-card-section>
    <q-card-actions>
      <q-space></q-space>
      <q-btn color="primary" label="Submit" flat @click="submitHandler"></q-btn>
    </q-card-actions>
  </q-card>
</template>
<script lang="ts">
import { mapActions } from 'pinia';
import { Loading } from 'quasar';
import dialogExt from 'src/extensions/dialog-ext';
import { useAlbumStore } from 'src/stores/album-store';
import { defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'AlbumPasswordRequest',
  setup() {
    return {
      password: ref('' as string),
      isPwd: ref(false),
    };
  },
  methods: {
    ...mapActions(useAlbumStore, ['submitAccess']),
    async submitHandler() {
      try {
        Loading.show();
        const result = await this.submitAccess(this.password);
        if (!result) {
          dialogExt.invalidAccess('Wrong password, try again.');
        }
      } finally {
        Loading.hide();
      }
    },
  },
});
</script>

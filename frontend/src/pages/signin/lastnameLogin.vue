<script setup>
import axios from "@/plugins/axios";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n();

const { authenticate } = useAuthStore();
const router = useRouter();

const data = reactive({
  valid: false,
  lastnameExist: false,
  lastname: "",
  registerid: "",
});

async function submit() {
  if (data.lastnameExist) {
    loginWithRegisterId();
  } else {
    checkLastName();
  }
}
async function checkLastName() {
  const auth = (
    await axios.post("/api/auth/checkLastName", {
      lastname: data.lastname,
    })
  ).data;
  if (auth) {
    data.lastnameExist = true;
  } else {
    useMessageStore().error($t("login.lastname_not_found"));
  }
}
async function loginWithRegisterId() {
  const auth = (
    await axios.post("/api/auth/loginWithRegisterId", {
      lastname: data.lastname,
      registerid: data.registerid,
    })
  ).data;

  if (!auth) {
    useMessageStore().error($t("login.incorrect_code"));
    return;
  }

  await authenticate(auth.access_token);

  router.push("/").catch(() => {});
}
</script>
<template>
  <v-form @submit.prevent="submit" v-model="data.valid">
    <v-card-text class="px-6">
      <v-text-field
        v-model="data.lastname"
        class="prepend-icon-wide"
        prepend-icon="mdi-account"
        :label="$t('login.lastname')"
        :placeholder="$t('login.lastname')"
        :rules="[$v.required()]"
        validate-on="blur"
      ></v-text-field>
      <v-text-field
        class="prepend-icon-wide"
        v-if="data.lastnameExist"
        prepend-icon="mdi-key"
        :label="$t('login.registration')"
        v-model="data.registerid"
        required
        :rules="[$v.required()]"
        type="number"
      ></v-text-field>
    </v-card-text>
    <v-card-actions class="justify-center pb-4">
      <v-btn v-show="!data.lastnameExist" type="submit" :disabled="!data.valid" color="secondary">
        {{ $t("login.sendLastname") }}
      </v-btn>
      <v-btn v-show="data.lastnameExist" type="submit" :disabled="!data.valid" color="secondary">
        {{ $t("login.submit") }}
      </v-btn>
    </v-card-actions>
  </v-form>
</template>

<style>
.prepend-icon-wide .v-input__prepend-outer {
  margin: 0 25px;
}
</style>

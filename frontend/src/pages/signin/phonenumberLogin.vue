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
  phoneNumberExists: false,
  phone: "",
  code: "",
});

async function submit() {
  if (data.phoneNumberExists) {
    loginWithCode();
  } else {
    requestCode();
  }
}
async function requestCode() {
  const auth = (
    await axios.post("/api/auth/sendCode", {
      phone: data.phone,
    })
  ).data;
  if (auth) {
    data.phoneNumberExists = true;
  } else {
    useMessageStore().error($t("login.phone_not_found"));
  }
}
async function loginWithCode() {
  const auth = (
    await axios.post("/api/auth/loginWithCode", {
      phone: data.phone,
      code: data.code,
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
      <v-phone-input
        defaultCountry="fr"
        v-model="data.phone"
        :countryLabel="null"
        :label="$t('login.phone')"
        :placeholder="$t('login.phone')"
        :preferCountries="['fr']"
        :rules="[$v.required()]"
        validate-on="blur"
      ></v-phone-input>
      <v-text-field
        class="prepend-icon-wide"
        v-if="data.phoneNumberExists"
        prepend-icon="mdi-key"
        :label="$t('login.code')"
        v-model="data.code"
        required
        :rules="[$v.required()]"
        type="number"
      ></v-text-field>
    </v-card-text>
    <v-card-actions class="justify-center pb-4">
      <v-btn v-show="!data.phoneNumberExists" type="submit" :disabled="!data.valid" color="secondary">
        {{ $t("login.sendCode") }}
      </v-btn>
      <v-btn v-show="data.phoneNumberExists" type="submit" :disabled="!data.valid" color="secondary">
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

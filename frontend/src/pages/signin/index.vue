<script setup>
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import PhonenumberLogin from "./phonenumberLogin.vue";
import LastnameLogin from "./lastnameLogin.vue";

const { t: $t } = useI18n();

const data = reactive({
  showPhoneForm: true
});

function switchForm() {
  data.showPhoneForm = !data.showPhoneForm;
}

</script>
<template>
  <div>
    <v-row justify="center" dense>
      <v-col cols="12" sm="8" md="6" lg="5" xl="4">
        <v-card class="mt-5 elevation-12">
          <v-card-title class="text-center pt-3">
            {{ $t("login.title") }}
          </v-card-title>
          <PhonenumberLogin v-if="data.showPhoneForm" />
          <LastnameLogin v-if="!data.showPhoneForm" />
          <v-card-actions class="justify-end">
            <v-btn append-icon="mdi-arrow-right" 
            :variant="data.showPhoneForm ? 'text' : 'contained'" @click="switchForm">
              Connexion par {{  data.showPhoneForm ? 'Nom de famille' : 'téléphone'  }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style>
.prepend-icon-wide .v-input__prepend-outer {
  margin: 0 25px;
}
</style>

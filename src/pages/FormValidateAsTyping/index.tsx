import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import { FormInput } from "../../UI/FomInput";
import {
  notEmptyValidator,
  onlyLetters,
  onlyNumbers,
} from "../../formValidators";
import { Form } from "../../UI/Form";
import {
  EfficientFormContextProvider,
  EfficientFormState,
} from "../../context/EfficientFormContextProvider";
import { Typography } from "@mui/material";

function FormValidateAsTyping() {
  const [showAddressFields, setShowAddressFields] = useState(false);

  const notifyChange = (formData: EfficientFormState) => {
    console.log(formData);
    if (formData.data["firstname"] && formData.data["lastname"]) {
      console.log("executed.");
      setShowAddressFields(true);
      return
    }
    setShowAddressFields(false);
  };

  const notifySubmit = (formData: EfficientFormState,haveErrors:boolean) => {
    if (!haveErrors) {
      console.log("Good all form data was sent.");
      return
    }
    console.log("Check for errors and try again.");
  };



  return (
    <Box>
      <Typography>Form that validates as typing.</Typography>
      <Typography variant="body2">Fill in the blanks to show extra fields.</Typography>
      <EfficientFormContextProvider notifyChange={notifyChange} notifySubmit={ notifySubmit}>
        <Form>
          <Grid
            sx={{ maxWidth: 350, margin: "auto" }}
            container
            columns={12}
            spacing={2}
          >
            <Grid item xs={12}>

              <FormInput
                label="Nombre"
                name="firstname"
                validators={[notEmptyValidator, onlyLetters]}
                validateAsTyping={true}
              />

            </Grid>
            <Grid item xs={12}>
              <FormInput
                label="Apellido"
                name="lastname"
                validators={[notEmptyValidator, onlyLetters]}
                validateAsTyping={true}
              />
            </Grid>
            
            {showAddressFields && (
              <>
                <Grid item xs={12}>
                  <FormInput
                    label="Calle"
                    name="street"
                    validators={[notEmptyValidator]}
                    validateAsTyping={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormInput
                    label="Ciudad"
                    name="city"
                    validators={[notEmptyValidator]}
                    validateAsTyping={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormInput
                    label="Codigo postal"
                    name="zip"
                    validators={[notEmptyValidator, onlyNumbers]}
                    validateAsTyping={true}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <input type="submit" />
            </Grid>
          </Grid>
        </Form>
      </EfficientFormContextProvider>
    </Box>
  );
}

export default FormValidateAsTyping;

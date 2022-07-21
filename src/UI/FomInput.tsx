import TextField from "@mui/material/TextField";
import { withContextEfficientFormInput } from "../context/EfficientFormContextProvider";

// Higher order component to reduce boiler plate.
export const FormInput = withContextEfficientFormInput((props: {
    errors: string[];
    label: string;
    name: string;
    onBlur: React.FocusEventHandler<any>;
    onChange: React.ChangeEventHandler<any>;
    value: string;
}) => {
    const hasErrors = props.errors?.length > 0;

    return (
        <TextField
            error={hasErrors}
            onChange={props.onChange}
            onBlur={props.onBlur}
            variant="outlined"
            label={props.label}
            name={props.name}
            value={props.value}
            fullWidth
            size="small"
            autoComplete="false"
            helperText={" " + props?.errors}
            FormHelperTextProps={{ sx: { mt: '-2px', fontSize: '10px' } }}
        />
    );
});
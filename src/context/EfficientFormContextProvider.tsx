import React, { createContext, memo, useCallback, useContext, useEffect, useState } from "react";

export type EfficientFormState = {
    validators: { [x: string]: validatorType[] };
    data: { [x: string]: string };
    errors: { [x: string]: string[] };
};
type EfficientFormContextValue = {
    value: EfficientFormState;
    setValue: React.Dispatch<any>;
    onSubmit: (e: any) => void;
};
export type validatorType = (formData: EfficientFormState) => string[];

// To execute all the inputs validator functions then return a single array of strings with the errors if any.
const executeValidators = (
    validators: validatorType[],
    formData: EfficientFormState
) => {
    let errors: string[] = [];
    for (let validator of validators) {
        errors = [...errors, ...validator(formData)];
    }
    return errors;
};



export const EfficientFormContext = createContext<EfficientFormContextValue>(
    {} as EfficientFormContextValue
);

// Form context.
export function EfficientFormContextProvider(props: {
    notifyChange?: (value: EfficientFormState) => void;
    notifySubmit?: (value: EfficientFormState, haveErrors: boolean) => void;
    children: any;
}) {
    // collection of form values
    const [value, setValue] = useState<EfficientFormState>({
        data: {},
        errors: {},
        validators: {},
    });

    useEffect(() => {
        // To debounce notify change.
        props.notifyChange && props.notifyChange(value);
    }, [value]);

    // Execute all validators and check for errors.
    const executeAllValidators = () => {
        let haveErrors = false;
        // Execute all validators and store their values.
        const validators = Object.entries(value.validators);

        // Reduce to make a new errors state.
        const errors = validators.reduce((acc: any, [name, validators]) => {
            // Store all errors related to the current input.
            let errors = [...executeValidators(validators, value)];

            // Assing on the first hit only.
            if (!haveErrors && errors.length > 0) haveErrors = true;

            // Assign errors to corrresponding input.
            acc[name] = errors;
            return acc;
        }, {});
        return { errors, haveErrors };
    };

    // basic onSubmit handler.
    const onSubmit = (e: any) => {
        e.preventDefault();
        let { errors, haveErrors } = executeAllValidators();
        setValue({ ...value, errors });
        props.notifySubmit && props.notifySubmit(value, haveErrors);
    };

    // Creates the context value.
    const contextValue = { value, setValue, onSubmit };

    // Returns the context provider.
    return (
        <EfficientFormContext.Provider value={contextValue}>
            {props.children}
        </EfficientFormContext.Provider>
    );
}

// Wrapper for the form element.
export const withContextEfficientForm = <T extends object>(
    Wrapped: React.ComponentType<T>
) => {
    const PureWrapped = memo(Wrapped);
    return (props: any) => {
        const { onSubmit, value } = useContext(EfficientFormContext);
        return <PureWrapped {...props} onSubmit={onSubmit} />;
    };
};


// Makes a copy of an object
export const makeInputNameFromLabel = (label: string) => {
    return label.toLowerCase().replace(/[^A-z]/g, "");
};

// Wrapper for Input .
export const withContextEfficientFormInput = <T extends object>(
    Wrapped: React.ComponentType<T>
) => {
    const PureWrapped: any = memo(Wrapped);
    return (props: {
        name:string;
        label: string;
        validators?: validatorType[];
        validateAsTyping?: boolean;
    }) => {
        const { value, setValue } = useContext(EfficientFormContext);

        // Make name from label.
        const inputName = props.name;

        // To register the input info to the state.
        const registerInput = useCallback(
            (name: string) => {
                setValue((formState: EfficientFormState) => {
                    // Bind label names to validators.
                    const tobeBound = { inputName: inputName, inputLabel: props.label };
                    const validators = props.validators?.map((func) =>
                        func.bind(tobeBound)
                    );

                    // Below code is a little bit verbose but efficient bacause it only mutates
                    // needed values instead of recreating the entire formState.
                    return {
                        ...formState,
                        // Set input values.
                        data: {
                            ...formState.data,
                            [name]: formState.data[name] || "",
                        },
                        // Set errors
                        errors: {
                            ...formState.errors,
                            [name]: formState.errors[name] || [],
                        },
                        // Store validators refrences to the state.
                        validators: {
                            ...formState.validators,
                            [name]: validators || [],
                        },
                    };
                });
            },
            [setValue]
        );

        // Register Input to state
        useEffect(() => {
            console.log("Inputs registered to state.");
            registerInput(inputName);
        }, []);

        // Handle onBlur error.
        const handleError = useCallback(({ target }: any) => {
            // if input has validators then.
            if (props.validators) {
                // gets the name of the input to handle the error for.
                const currentInputName: string = target["name"];
                setValue((formState: EfficientFormState) => {
                    // Execute all validators.
                    const errors = executeValidators(
                        formState.validators[currentInputName] || [],
                        formState
                    );
                    // Assign errors if any.
                    if (errors.length > 0) {
                        return {
                            ...formState,
                            errors: {
                                ...formState.errors,
                                [currentInputName]: errors,
                            },
                        };
                    }
                    // If it doesn't have any errors assing empty array.
                    return {
                        ...formState,
                        errors: {
                            ...formState.errors,
                            [currentInputName]: [],
                        },
                    };
                });
            }
        }, []);

        // Handle the input change.
        const handleChange = useCallback(
            (event: any) => {
                const { target } = event;
                setValue((formState: EfficientFormState) => ({
                    ...formState,
                    data: {
                        ...formState.data,
                        [target["name"]]: target["value"],
                    },
                }));
                // This function calls set state again
                // This does not result in 2 rerenders because
                // React bashes the changes then execute the render method.
                if (props.validateAsTyping) handleError(event);
            },
            [inputName]
        );

        // handle the input Onblur event;

        return (
            <PureWrapped
                // To rmove react warning about uncontrol becoming controlled.
                name={inputName}
                label={props.label}
                value={value.data[inputName] || ""}
                onChange={handleChange}
                onBlur={handleError}
                errors={value.errors[inputName]}
            />
        );
    };
};

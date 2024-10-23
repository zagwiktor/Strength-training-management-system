import { registerDecorator, ValidationOptions, ValidatorConstraintInterface } from "class-validator";

export class isTempo implements ValidatorConstraintInterface {
    validate(tempo: any) {
        return (
          Array.isArray(tempo) &&
          tempo.length === 4 &&
          tempo.every((value) => typeof value === 'number')
        );
    }

    defaultMessage() {
        return 'Tempo must be an array of four numbers.';
    }
    
}

export function IsTempoValidation(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isTempo',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: isTempo,
      });
    };
}
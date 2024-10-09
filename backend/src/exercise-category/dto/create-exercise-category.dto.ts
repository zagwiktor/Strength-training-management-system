import { IsNotEmpty, IsString, Length } from "class-validator";
import { User } from "src/user/entities/user.entity";

export class CreateExerciseCategoryDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 15, { message: 'Name must be between 5 and 15 characters long.' })
    name: string;

    author: User;
}

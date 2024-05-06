import bcrypt from "bcryptjs";

export const rondas = 10;

export function hashear(contraseña) {
    const salt = bcrypt.genSaltSync(rondas);

    return bcrypt.hashSync(contraseña, salt);
}

export function comparar (contraseña, hashcontraseña) {
    return bcrypt.compareSync(contraseña, hashcontraseña);
}
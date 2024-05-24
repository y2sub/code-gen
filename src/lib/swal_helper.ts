import Swal, { type SweetAlertIcon, type SweetAlertOptions } from "sweetalert2";


export enum ColorTheme {
    Dark = "dark",
    Light = "light",
    System = "sys"
}

function getColorTheme(theme: ColorTheme): ColorTheme {

    if (theme === ColorTheme.System) {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? ColorTheme.Light : ColorTheme.Dark;
    } else {
        return theme
    }
}


export async function fireSweetAlert(options: SweetAlertOptions, theme: ColorTheme = ColorTheme.System, onConfirm: (() => void) | undefined = undefined) {
    theme = getColorTheme(theme)
    let background = theme === ColorTheme.Dark ? "rgb(51 65 85)" : "#fff"
    let color = theme === ColorTheme.Dark ? "#fff" : "#000"
    options = { ...options, background, color }
    const result = await Swal.fire(options);
    if (result.isConfirmed && onConfirm) {
        onConfirm()
    }

    return result;
}



// export async function fireDeleteConfirmationDialog() {
//     const message = "Are you sure you want to delete this record";
//     return fireDialog(message, "question", ColorTheme.sys);
// }

export const toastDefaultOptions: SweetAlertOptions = {
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    showCancelButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: "info",
}



export function fireToast(title: string, icon: SweetAlertIcon = "info", theme: ColorTheme = ColorTheme.System) {
    theme = getColorTheme(theme)
    let background = theme === ColorTheme.Dark ? "rgb(51 65 85)" : "#fff"
    let color = theme === ColorTheme.Dark ? "#fff" : "#000"
    let options = {
        ...toastDefaultOptions,
        icon,
        title,
        background,
        color,
    };
    Swal.fire(options)
}

export function fireSuccessToast(message: string, theme: ColorTheme = ColorTheme.System) {
    fireToast(message, "success", theme)
}

export function fireErrorToast(message: string, theme: ColorTheme = ColorTheme.System) {
    fireToast(message, "error", theme)
}

export function fireSaveSuccessToast() {
    fireSuccessToast("Record has been updated", ColorTheme.System);
}

export function fireSaveErrorToast() {
    fireErrorToast("Failed to update record", ColorTheme.System);
}



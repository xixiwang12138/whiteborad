export const AppConfig: {
	scanRoot: string

	installModules: "all" | string[]
	installPlugins: "all" | string[]

	enableEncrypt: boolean
	enableNoEncrypt: boolean

} = {
	scanRoot: "./Refactor",

	installModules: "all",
	installPlugins: "all",

	enableEncrypt: false,
	enableNoEncrypt: true
}

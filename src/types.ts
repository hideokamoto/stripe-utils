export interface DeclineCodeTranslation {
	description: string
	nextUserAction: string
}

export interface DeclineCodeInfo {
	description: string
	nextSteps: string
	nextUserAction: string
	translations: {
		ja_JP: DeclineCodeTranslation
	}
}

export interface DeclineCodeResponse {
	docVersion: string
	code: DeclineCodeInfo | Record<string, never>
}

export type DeclineCodes = Record<string, DeclineCodeInfo>

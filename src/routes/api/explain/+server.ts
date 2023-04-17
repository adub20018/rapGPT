import { OPENAI_API_KEY } from '$env/static/private'
import { oneLine, stripIndent } from 'common-tags'
import type { RequestHandler } from './$types'
import type { CreateCompletionRequest } from 'openai'
import { error, type Config } from '@sveltejs/kit'

export const config: Config = {
	runtime: 'edge'
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!OPENAI_API_KEY) {
			throw new Error('OPENAI_API_KEY env var not set')
		}

		const requestData = await request.json()

		if (!requestData) {
			throw new Error('Request data missing')
		}

		const { context, rapper } = requestData

		if (!context) {
			throw new Error('No context provided')
		}

		const prompt = stripIndent`
        ${oneLine`
        You are RapGPT. Your job is to play the role of the rapper ${rapper}. You should combine your knowledge of hip hop, rap, as well as your knowledge of any part of the mentioned context, in order to generate hard hitting rhymes. 
        `}

        Context:"""${context.trim()}"""

        Answer:
        `

		const completionOpts: CreateCompletionRequest = {
			model: 'text-davinci-003',
			prompt,
			max_tokens: 256,
			temperature: 0.8,
			stream: true
		}

		const response = await fetch('https://api.openai.com/v1/completions', {
			headers: {
				Authorization: `Bearer ${OPENAI_API_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(completionOpts)
		})

		if (!response.ok) {
			const err = await response.json()
			console.error(err)
			throw new Error('Failed to create completion', err)
		}

		return new Response(response.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
	} catch (err) {
		console.error(err)
		throw error(500, 'An error occurred')
	}
}

import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */

export async function run() {
    try {
        // The the inputs are defined in action metadata file
        const isFullRefresh = core.getBooleanInput('is-full-refresh', { required: false })
        const models = core.getInput('models', { required: false }).trim()

        // no inputs provided
        if (!isFullRefresh && !models) {
            core.info('No models provided and is-full-refresh is false. Nothing to do!')
            core.setOutput('options', '') 
            return
        }

        // input cannot include semicolon, && or ||
        if (models.includes(';') || models.includes('&&') || models.includes('||')) {
            throw new Error('input contains a forbidden characters')
        }

        let models_array = models.replaceAll(' ', '').split(',')

        const prepend_s = (model) => {
            let m = model.trim()
            return m ? `-s ${m}` : ''
        }

        let options_array = models_array.map(prepend_s).filter(Boolean)

        if (isFullRefresh === true) {
            options_array.push('--full-refresh')
        }

        const output = options_array.join(' ')
        core.setOutput('options', output)
        await core.summary.addRaw(`Manually entered options: ${output}`, true).write()

        // Output the payload for debugging
        core.info(
            `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
        )
    } catch (error) {
        // Fail the workflow step if an error occurs
        core.setFailed(error.message)
    }
}

import { getWizardConfig } from '../../services/damage-wizard.service'

export default defineEventHandler(async () => getWizardConfig())

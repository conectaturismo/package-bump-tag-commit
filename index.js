/**
 * GitHub Action Entry Point
 * 
 * This is the main entry point for the GitHub Action.
 * It uses the new modular architecture to perform version bumping operations.
 */

const ActionOrchestrator = require('./src/ActionOrchestrator');

/**
 * Main execution function
 * @returns {Promise<void>}
 */
const run = async () => {
  const orchestrator = new ActionOrchestrator();
  await orchestrator.execute();
};

// Execute the action when this file is run directly
if (require.main === module) {
  run().catch((error) => {
    console.error('Action failed:', error.message);
    process.exit(1);
  });
}

module.exports = run;

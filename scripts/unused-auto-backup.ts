import { runAutoBackupCycle } from "../lib/models/settings.model";

async function main() {
  const result = await runAutoBackupCycle({
    userId: null,
    endpoint: "scripts/auto-backup",
    method: "SCRIPT",
  });

  console.log(result.message);
  if (result.settings?.last_backup) {
    console.log("Last backup at:", result.settings.last_backup);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Auto-backup failed", error);
    process.exit(1);
  });

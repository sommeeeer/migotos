import type { OpenNextConfig } from '@opennextjs/aws/types/open-next';

const config = {
  // buildCommand: "echo 'Skippinig next build'",
  default: {
    override: {
      tagCache: 'dynamodb-lite',
      incrementalCache: 's3-lite',
      queue: 'sqs-lite',
    },
  },
  dangerous: {
    disableTagCache: true,
  },
} satisfies OpenNextConfig;

export default config;

export default (): Record<string, unknown> => ({
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9094'],
    clientId: process.env.KAFKA_CLIENT_ID || 'stock-service',
    groupId: process.env.KAFKA_GROUP_ID || 'stock_service_group',
  },
});

export async function ensureTopic(kafka, topic, numPartitions) {
  const admin = kafka.admin();
  await admin.connect();
  const topics = await admin.listTopics();
  if (!topics.includes(topic)) {
    await admin.createTopics({
      topics: [{ topic, numPartitions, replicationFactor: 1 }],
    });
    console.log(`created topic ${topic} with ${numPartitions} partitions\n`);
  }
  await admin.disconnect();
}

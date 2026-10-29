// Initialize a single-node replica set for local MongoDB transaction demos.
// The advertised localhost address lets applications on the host use port 27017.
try {
    const status = rs.status();
    if (status.ok === 1) {
        print("Replica set is already initialized.");
    } else {
        throw new Error("Replica set status is not ready.");
    }
} catch (error) {
    const result = rs.initiate({
        _id: "rs0",
        members: [{ _id: 0, host: "localhost:27017" }]
    });
    if (result.ok !== 1) {
        throw new Error(`Could not initialize rs0: ${JSON.stringify(result)}`);
    }
    print("Initialized single-node replica set rs0.");
}

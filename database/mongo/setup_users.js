// Create least-privilege demo users in the BankSphere database.
// mongosh prompts securely for each password; supply unique local demo passwords.
const banksphere = db.getSiblingDB("banksphere");

const users = [
    { user: "admin", roles: [{ role: "dbOwner", db: "banksphere" }] },
    { user: "teller", roles: [{ role: "readWrite", db: "banksphere" }] },
    { user: "readOnlyAnalyst", roles: [{ role: "read", db: "banksphere" }] }
];

users.forEach(({ user, roles }) => {
    if (banksphere.getUser(user)) {
        print(`User ${user} already exists; leaving its credentials and roles unchanged.`);
        return;
    }
    banksphere.createUser({ user, pwd: passwordPrompt(), roles });
    print(`Created ${user} in banksphere.`);
});

module.exports = {
  packagerConfig: {
    osxSign: {},
    // ...
    osxNotarize: {
      tool: "notarytool",
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    },
    // ...
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "linux"],
      config: {
        // the config can be an object
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: (arch) => ({
        // it can also be a function taking the currently built arch
        // as a parameter and returning a config object, e.g.
      }),
    },
  ],
};

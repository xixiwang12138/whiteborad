// app.js
App({
  onLaunch() {
    wx.cloud.init({
      // env: "env-8gbpg0wjca0c43ce",
      env: "env-8gbpg0wjca0c43ce",
      traceUser: true
    });
  },
  globalData: {
  }
})

// pages/skill/skill.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgSrc: '',
    model: false,
    animation: wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    }),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  writeFile() {
    const fs = wx.getFileSystemManager();
    fs.mkdirSync(`${wx.env.USER_DATA_PATH}/aaa`, false);
    const fd = fs.openSync({
      filePath: `${wx.env.USER_DATA_PATH}/aaa`,
      flag: 'a+'
    })
    const stats = fs.fstatSync({ fd });
    console.log(`${wx.env.USER_DATA_PATH}/aaa`);
    console.log(stats.isDirectory());

    fs.writeFileSync(`${wx.env.USER_DATA_PATH}/aaa/hello.txt`, 'hello, world', 'utf8');
    fs.writeFileSync(`${wx.env.USER_DATA_PATH}/aaa/hello.txt`, 'hello, world 222', 'utf8');
    console.log(wx.env.USER_DATA_PATH);
    console.log(fs);
  },
  readFile() {
    wx.getFileSystemManager().readFile({
      filePath: wx.env.USER_DATA_PATH + '/aaa/hello.txt',
      encoding: 'utf-8',
      success: res => {
        console.log(res.data)
      },
      fail: console.error
    })
  },
  getFileList() {
    wx.getFileSystemManager().readdir({
      dirPath: `${wx.env.USER_DATA_PATH}`,
      success(res) {
        console.log(res.files)
      },
      fail: console.error
    })
  },
  chooseImage() {
    wx.chooseMedia({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        console.log(res);
        const tempFiles = res.tempFiles // 本地临时文件列表
        if (tempFiles.length > 0) {
          this.setData({
            imgSrc: tempFiles[0].tempFilePath
          })
        }
      }
    });
  },
  chooseFile() {
    // wx.choosePoi
    // wx.chooseContact
    // wx.chooseLocation
    // wx.chooseMedia
    // wx.chooseLicensePlate
    // wx.chooseInvoice
    // wx.chooseInvoiceTitle
    wx.chooseMessageFile({
      count: 1, // 默认9
      success: (res) => {
        console.log(res);
        const tempFiles = res.tempFiles;
        console.log(tempFiles);
      }
    })
  },

  handleMaskToggle(e: any) {
    console.log('handleMaskToggle');
    this.initModel(e.currentTarget.dataset.status)
  },
  initModel(status: string) {
    const animation = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    this.data.animation = animation;
    animation.translateX(-150).step();
    this.setData({
      animationData: animation.export()
    })
    setTimeout(() => {
      animation.translateX(0).step()
      this.setData({
        animationData: animation
      })
      if (status == "close") {
        this.setData({
          model: false
        })
      }
    }, 100)
    if (status == "open") {
      this.setData({
        model: true
      })
    }
  },
})
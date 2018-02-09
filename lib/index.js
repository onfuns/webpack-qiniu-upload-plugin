const qiniu = require('qiniu')

class QiniuUploadPlugin {
  constructor(options={}) {
    const { ACCESS_KEY, SECRET_KEY, domain, bucket, zone} = options
    if (!ACCESS_KEY || !SECRET_KEY || !domain || !bucket) {
        throw new Error("ACCESS_KEY,SECRET_KEY,domain,bucket must be set")
    }
    this.defaultOptions = Object.assign({
      exclude: [],
      refreshCdn:false,
    },options)
    const zones = ['z0','z1','z2','na0','as0']
    if(!zone || zones.indexOf(zone) < 0 ){
      this.defaultOptions.zone = zones[0]
    }
    this.mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY)
  }

  apply (compiler){
    compiler.plugin('after-emit', (compilation, callback) => {
      const { assets } = compilation
      const { bucket, zone,exclude,domain } = this.defaultOptions
      const events = []
      const publicPath = compilation.options.output.publicPath.slice(1)
      const config = new qiniu.conf.Config()
      config.zone = qiniu.zone[`Zone_${zone}`]
      const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket })
      const uploadToken = putPolicy.uploadToken(this.mac)
      const formUploader = new qiniu.form_up.FormUploader(config)
      const putExtra = new qiniu.form_up.PutExtra()
      const files = Object.keys(assets)
        .filter((filename) => {
          return assets[filename].emitted && exclude.every(function(ex){
            return filename.indexOf(ex) < 0
          })
        })
        .map(function(filename){
          const fullPath = publicPath + filename
          const promise = new Promise((resolve, reject) => {
            formUploader.putFile(uploadToken, fullPath, assets[filename].existsAt, putExtra, function(err,res){
              if (!err) {
                resolve(res)
              } else {
                console.log(err)
                reject(err)
              }
            })
          })
          events.push(promise)
          return `${domain}/${filename}`
        })
        this.files = files
        this.upload(events)
      })
    }
  upload(events){
    const { refreshCdn,domain } = this.defaultOptions
    Promise.all(events)
    .then(function(res){
      if(refreshCdn && !domain){
        throw new Error('when refresh the cdn of qiniu,this domain must be set')
      }
      refreshCdn && domain && this.refreshCdn()
      callback()
    })
    .catch(function(e){
      callback(e)
    })
  }
  refreshCdn(){
    const cdnManager = new qiniu.cdn.CdnManager(this.mac)
    cdnManager.refreshUrls(this.files, function(err, respBody, respInfo) {
      if (err) {
        throw err;
      }
      if (respInfo.statusCode == 200) {
        console.log('the cdn of qiniu refresh success')
      }
    })
  }
}

module.exports = QiniuUploadPlugin
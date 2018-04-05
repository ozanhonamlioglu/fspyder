const Nightmare = require('nightmare');
const vo = require('vo');
const fs = require('fs');
const cheerio = require('cheerio');

function bufferFile(path) {
  return fs.readFileSync(path);
}

process.on("message", (options) => {
  //focusedWindow.webContents.send("USER_INVALID", { user_invalid: true })

  let nightmare;
  const typeSpeed = 2, waiting = 5000;
  const { prx, port, username, password } = options.proxy
  const { search } = options
  const fbUsername = options.credentials.username
  const fbPassword = options.credentials.password

  if(!fbUsername || !fbPassword){

    process.send({ no_credentials: true })
    process.send({ unsuccessfully: true })
    process.kill(process.pid)

  }

  vo(function * () {

    if(prx && port){

          nightmare = new Nightmare({
            show: true, 
            typeInterval: typeSpeed,
            waitTimeout: waiting,
            switches: {
              'proxy-server': `${prx}:${port}`
            }
          })

    } else {
      
          nightmare = new Nightmare({
            show: true, 
            typeInterval: typeSpeed,
            waitTimeout: waiting
          })

    }
  
    if(username && password){

          yield nightmare
          .authentication(username, password)
          .goto("https://m.facebook.com");  

    } else {

          yield nightmare.goto("https://m.facebook.com");

    }
    
    // form kutuları çıkana kadar bekle, daha sonra doldur ve submit et.
    let form_error = false
    yield nightmare
    .wait("#m_login_email, #m_login_password")
    .catch(e => {
      form_error = true
      console.log("process ending, because fields are not found")
    })

    // formlar tam dolmamışsa süreci öldür ve front ende bilgi gönder, kullanıcıyı haberdar et
    if(form_error){
      yield nightmare.end()
    }

    // form kutuları çıktıktan sonra bilgileri doldur ve submit et.
    yield nightmare
    .type("input[name=email]", fbUsername)
    .type("input[name=pass]", fbPassword)
    .click("button[name=login]")

    // sayfa da beni hatırla seçeneği çıkarsa ya da kullanıcı adı yanlış ise
    let link = false
    let user_opts_error = false
    yield nightmare
    .wait("a[href='/login/save-device/cancel/?flow=interstitial_nux&nux_source=regular_login']")
    .then(_ => link = false)
    .catch(_ => user_opts_error = true)

    if(link){

          // beni hatırla seçeneği çıksa dahi sonuç olarak sayfaya girmiş bulunmaktayız, 
          // bu yüzden "hatırla" ya da "şimdi değil" butonlarına tıklamaya gerek olmadığını farkettim,
          // direkt olarak sonraki linke yönlendiriyorum. ama burası şimdilik böyle kalsın.
          // ana konu else kısmında başlıyor, burası dönmeyecek.

          yield nightmare.click("a._54k8")

          yield nightmare.goto(`https://m.facebook.com/search/top/?q=${search}&ref=content_filter`)
          .wait(2000)
          .end()

    } else {

          if(user_opts_error){

                yield nightmare
                .end()
                .then(function () {
                  process.send({ unsuccessfully: true })
                  process.send({ user_invalid: true })
                  process.kill(process.pid)
                })

          }else{

                let body_empty = false
                yield nightmare.goto(`https://m.facebook.com/search/top/?q=${search}&ref=content_filter`)
                .wait("#BrowseResultsContainer")
                .catch(_ => body_empty = true)

                if (body_empty) {
                  yield nightmare.end()
                  .then(function () {
                    process.send({ unsuccessfully: true })
                    process.send({ empty_page: true })
                    process.kill(process.pid)
                  })
                }

                var previousHeight, currentHeight=0;
                while(previousHeight !== currentHeight) {
                  previousHeight = currentHeight;
                  var currentHeight = yield nightmare.evaluate(function() {
                    return document.body.scrollHeight;
                  });
                  yield nightmare.scrollTo(currentHeight, 0)
                    .wait(2000);
                }

                yield nightmare.evaluate(function(){
                  const doc = document.querySelector("#BrowseResultsContainer").innerHTML
                  return doc
                })
                .then(function(body){

                            if(options.socketId){
                                      // if there is a socketId and this is you
                                      var $ = cheerio.load(body)
                                      // write the page here...
                                      let htmlData
                                      var modelRole = $("div").filter("[data-module-result-type]");
                                      for(var i = 0; i < modelRole.length; i++){
                                          var outData = $(modelRole[i]).html();
                                          var $ = cheerio.load(outData)
                                          var moduleType = $("div").filter("[data-xt]");
                                          for (var j = 0; j < moduleType.length; j++) {
                                              indata = $(moduleType[j]).html();
                                              htmlData += indata
                                              htmlData += "<hr>"
                                          }
                                      }
                                      let BUFFER = new Buffer(htmlData);
                                      process.send({page: true, contents: BUFFER, filename: options.socketId, socket: true})
                            }else{
                                      // if there is no socketId and this is me.
                                      var $ = cheerio.load(body)
                                      let htmlData;
                                      var modelRole = $("div").filter("[data-module-result-type]");
                                      for(var i = 0; i < modelRole.length; i++){
                                          var outData = $(modelRole[i]).html();
                                          var $ = cheerio.load(outData)
                                          var moduleType = $("div").filter("[data-xt]");
                                          for (var j = 0; j < moduleType.length; j++) {
                                              indata = $(moduleType[j]).html();
                                              htmlData += indata;
                                              htmlData += "<hr>"
                                          }
                                      }
                                      let BUFFER = new Buffer(htmlData);
                                      process.send({page: true, contents: BUFFER, filename: "me", socket: false})
                            }

                })
                
                yield nightmare
                .end(_ => "end of story")
                .then(console.log)

          }
      
    }


  })(
    function(err) {
      if (err) {

            console.log('[-] synchronous task error!', err);
            
            process.send({ unsuccessfully: true })

            if(err.code == -501){
              process.send({ ssl_required: true })
              process.kill(process.pid)
            }

            if(err.code == -130){
              process.send({ proxy_failed: true })
              process.kill(process.pid)
            }

            if(err.code == -7){
              process.send({ timed_out: true })
              process.kill(process.pid)
            }

            if(err.code == -336){
              process.send({ no_support_proxy: true })
              process.kill(process.pid)
            }

            if(err.code == -106){
              process.send({ no_internet: true })
              process.kill(process.pid)
            }

            if(err.code == -105){
              process.send({ not_resolved: true })
              process.kill(process.pid)
            }

        
      } else {

            console.log('[+] synchronous tasks are completed successfully');
            process.send({ successfully: true })
            process.kill(process.pid)

      }
    }
  )

});
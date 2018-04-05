const Nightmare = require('nightmare');
const vo = require('vo');
const fs = require('fs');
const cheerio = require('cheerio');

let nightmare;
let myparser;
let page;
const typeSpeed = 5, waiting = 5000;
let tmpath = "./temp/test.html";

vo(function * () {
    
nightmare = new Nightmare({
show: true, 
typeInterval: typeSpeed,
waitTimeout: waiting
})

yield nightmare.goto("https://m.facebook.com");

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
.type("input[name=email]", "ozanhon")
.type("input[name=pass]", "askp0798bmc_071994")
.click("button[name=login]")

// sayfa da beni hatırla seçeneği çıkarsa ya da kullanıcı adı yanlış ise
let link = false
let user_opts_error = false
yield nightmare
.wait("a[href='/login/save-device/cancel/?flow=interstitial_nux&nux_source=regular_login']")
.then(_ => link = false)
.catch(_ => user_opts_error = true)

if(link){

} else {

    if(user_opts_error) {

        yield nightmare
        .end()
        .then(function () {
            process.send({ unsuccessfully: true })
            process.send({ user_invalid: true })
            process.kill(process.pid)
        })

    } else {

        yield nightmare.goto("https://m.facebook.com/search/top/?q=hacker&ref=content_filter&tsid=0.11544980632763857&source=typeahead")
        .wait("#BrowseResultsContainer")

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
        .then(function (body) {
            var $ = cheerio.load(body)
            // write the page here...
            var clearer = fs.createWriteStream(tmpath, {
                flags: 'w'
            })
            clearer.write("");
            clearer.end()
            var logger = fs.createWriteStream(tmpath, {
                flags: 'a'
            })
            var modelRole = $("div").filter("[data-module-result-type]");
            for(var i = 0; i < modelRole.length; i++){
                var outData = $(modelRole[i]).html();
                var $ = cheerio.load(outData)
                var moduleType = $("div").filter("[data-xt]");
                for (var j = 0; j < moduleType.length; j++) {
                    indata = $(moduleType[j]).html();
                    logger.write(indata);
                    logger.write("<hr>");
                }
            }
            logger.end();
        })
        
        yield nightmare
        .end()
        .then()

    }

}


})(
    function(err) {
        if (err) {
        console.log('[-] synchronous task error!', err);
        } else {
        console.log('[+] synchronous tasks are completed successfully');
        }
    }
)

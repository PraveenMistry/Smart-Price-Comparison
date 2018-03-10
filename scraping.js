var cheerio = require('cheerio');
var request = require('request');
var fs      = require('fs');
var uuidv1  = require('uuid/v1');
var async   = require('async');

var flipkartData  = [];
var amazonData    = [];
var snapdealData  = [];
var paytmData     = [];

var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.env.PORT, 10) || 3003,
    publicDir = process.argv[2] || __dirname + '/public';

//Show homepage
app.get("/", function (req, res) {
  res.redirect("/index.html");
});

//Search page
app.get("/search/", function (req, res) {
  res.redirect("/search.html");
}); 


//Search API for AJAX
app.get('/search/:keyword', function(req, res) {
    var keyword = req.params.keyword;

    var flipkartURL = 'https://www.flipkart.com/search?q='+keyword+'';
    var snapdealURL = 'https://www.snapdeal.com/search?keyword='+keyword+'';
    var paytmURL    = 'https://search.paytm.com/search?userQuery='+keyword+'';
    var amazonURL   = 'https://www.amazon.in/mn/search/ajax/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords='+keyword+'';

      function getProductFromFlipkart(cdGetProductFromFlipkart) {
        
        var flipkartFileName = "data/flipkart"+uuidv1()+".txt";
        fs.open(flipkartFileName, 'w', function (err, file) {
          if (err) throw err;
          console.log('flipkartFileName created!');
        });

        request({
            method: 'GET',
            url: flipkartURL
        }, function(err, response, body) {
            if (err) return console.error(err);
            // console.log("response",response)
            // console.log("body",typeof body);
            var $ = cheerio.load(body);

            fs.writeFile('data/scrapeFlipkartPage.html', body.toString(), function (err) {
              if (err) throw err;
              console.log('scrapeFlipkartPage created!');
            });

            // console.log("$('div._3yI_5w')",$('div._3yI_5w').html());
            // console.log("$('div._2-gKeQ')",$('div._2-gKeQ').html());

            if($('div._3yI_5w').html()!==null){
              $('div._31eJXZ').each(function( index ) {
                  var flipkartProductName  = $(this).find('a._2cLu-l').attr('title')?$(this).find('a._2cLu-l').attr('title').trim():'';
                  var flipkartProductURL   = $(this).find('a.Zhf2z-').attr('href')?$(this).find('a.Zhf2z-').attr('href').trim():'';
                  var flipkartProductPrice = $(this).find('div._1vC4OE').text()?$(this).find('div._1vC4OE').text().trim().replace("₹",""):'';

                  // str.replace("Microsoft", "W3Schools")

                  flipkartData.push({
                    'productName':flipkartProductName,
                    'productURL':flipkartProductURL,
                    'productPrice':flipkartProductPrice,
                  });

                  // console.log("Title: " + flipkartProductName);
                  // console.log("flipkartProductURL: " + flipkartProductURL);
                  // console.log("flipkartProductPrice: " + flipkartProductPrice);
                  fs.appendFileSync(flipkartFileName, 'Title: '+flipkartProductName + '\n URL: \n' +'https://www.flipkart.com'+ flipkartProductURL + '\n Price:\n '+ flipkartProductPrice + '\n\n\n');
              });
            }else if($('div._2-gKeQ').html()!==null){
                $('div._2-gKeQ').each(function( index ) {
                  var flipkartProductName  = $(this).find('div._3wU53n').text()?$(this).find('div._3wU53n').text().trim():'';
                  var flipkartProductURL   = $(this).find('a._1UoZlX').attr('href')?$(this).find('a._1UoZlX').attr('href').trim():'';
                  var flipkartProductPrice = $(this).find('div._1vC4OE').text()?$(this).find('div._1vC4OE').text().trim().replace("₹",""):'';
                  // console.log("Title: " + flipkartProductName);
                  // console.log("flipkartProductURL: " + flipkartProductURL);
                  // console.log("flipkartProductPrice: " + flipkartProductPrice);

                  flipkartData.push({
                    'productName':flipkartProductName,
                    'productURL':flipkartProductURL,
                    'productPrice':flipkartProductPrice,
                  });

                  fs.appendFileSync(flipkartFileName, 'Title: '+flipkartProductName + '\n flipkartURL: \n' +'https://www.flipkart.com'+ flipkartProductURL + '\n Price:\n '+ flipkartProductPrice + '\n\n\n');
              });
            }
            cdGetProductFromFlipkart(null);
        });
      }

      function getProductFromSnapdeal(cdGetProductFromSnapdeal) {
        
        var snapdealFileName = "data/snapdeal"+uuidv1()+".txt";
        fs.open(snapdealFileName, 'w', function (err, file) {
          if (err) throw err;
          console.log('snapdealFileName created!');
        });

        request({
            method: 'GET',
            url: snapdealURL
        }, function(err, response, body) {
            if (err) return console.error(err);
            
            var $ = cheerio.load(body);

            fs.writeFile('data/scrapeSnapdealPage.html', body.toString(), function (err) {
              if (err) throw err;
              console.log('scrapeSnapdealPage.html created!');
            });

            // console.log("$('div.product-tuple-listing')",$('div.product-tuple-listing').html());
            

            if($('div.product-tuple-listing').html()!==null){
              $('div.product-tuple-listing').each(function( index ) {
                  var snapdealProductName  = $(this).find('p.product-title').attr('title')?$(this).find('p.product-title').attr('title').trim():'';
                  var snapdealProductURL   = $(this).find('div.product-tuple-image a').attr('href')?$(this).find('div.product-tuple-image a').attr('href').trim():'';
                  var snapdealProductPrice = $(this).find('span.product-price').text()?$(this).find('span.product-price').text().trim().replace("Rs.  ",""):'';
              
                  snapdealData.push({
                    'productName':snapdealProductName,
                    'productURL':snapdealProductURL,
                    'productPrice':snapdealProductPrice,
                  });

                  fs.appendFileSync(snapdealFileName, 'Title: '+snapdealProductName + '\n URL: \n' + snapdealProductURL + '\n Price:\n '+ snapdealProductPrice + '\n\n\n');
              });
            }
            cdGetProductFromSnapdeal(null);
        });

      }

      function getProductFromPaytm(scGetProductFromPaytm) {
    
        request({
            method: 'GET',
            url: paytmURL
        }, function(err, response, body) {
            if (err) return console.error(err);
            var paytmJson = JSON.parse(body);
            var paytmBody = JSON.stringify(body);
            var $ = cheerio.load(paytmBody);

            fs.writeFile('data/scrapePaytmPage.json', paytmBody, function (err) {
              if (err) throw err;
              console.log('scrapePaytmPage.json created!');
            });

            console.log("-------------------Paytm Data--------------------------------");
            var gridLayout = paytmJson['grid_layout'];
            for (var i = 0; i < gridLayout.length; i++) {
              // console.log("Product Name ",gridLayout[i]['name']);
              // console.log("Product url ",gridLayout[i]['url']);
              // console.log("Product url_type ",gridLayout[i]['url_type']);
              // console.log("Product offer_price ",gridLayout[i]['offer_price']);

              paytmData.push({
                'productName':gridLayout[i]['name'],
                'productURL':gridLayout[i]['url'],
                'productPrice':gridLayout[i]['offer_price'],
              });
            }
           
            scGetProductFromPaytm(null);
        });

      }

      function getProductFromAmazon(cdGetProductFromAmazon) {
        
        request({
            method: 'GET',
            url: amazonURL
        }, function(err, response, body) {
            if (err) return console.error(err);
            
            var amazonBody = JSON.stringify(body);
            var amazonJson = JSON.parse(amazonBody);
            var $ = cheerio.load(amazonBody);
            fs.writeFile('data/scrapeAmazonPage.json', amazonBody, function (err) {
              if (err) throw err;
              console.log('scrapeAmazonPage.json created!');
            });


            console.log("-------------------amazon Data--------------------------------")
            // To get data 
              // centerBelowPlus
                // btfResults
                  // s-result-item
            // var  amazonJsonArray  =  amazonJson.split("&&&");
            // console.log("amazonJson - centerBelowPlus: ",amazonJsonArray[12]);

            // for (var i = 0; i < amazonJsonArray.length; i++) {
            //   console.log("amazonJson - i : ",i,amazonJsonArray[i]);
            //   console.log("\n");
            // }
            
          cdGetProductFromAmazon(null);  
        });
      }

      function getMin(data) {
        return data.reduce((min, p) => p.productPrice < min ? p.productPrice : min, data[0].productPrice?data[0].productPrice:0);
      }	

      function getIndex(data,minPrice) {
        var index = data.map(function(e) { return e.productPrice; }).indexOf(minPrice);
        return index;
      }

      function camputeData(cdCamputeData) {

        var flipkartProductName = flipkartData.length>0?flipkartData[getIndex(flipkartData,getMin(flipkartData))+1]['productName']:'Not available in Flipkart';
        var flipkartProductURL = flipkartData.length>0?flipkartData[getIndex(flipkartData,getMin(flipkartData))+1]['productURL']:'Not available in Flipkart';
        var flipkartProductPrice = flipkartData.length>0?flipkartData[getIndex(flipkartData,getMin(flipkartData))+1]['productPrice']:'Not available in Flipkart';

        var snapdealProductName = snapdealData.length>0?snapdealData[getIndex(snapdealData,getMin(snapdealData))+1]['productName']:'Not available in Snapdeal';
        var snapdealProductURL = snapdealData.length>0?snapdealData[getIndex(snapdealData,getMin(snapdealData))+1]['productURL']:'Not available in Snapdeal';
        var snapdealProductPrice = snapdealData.length>0?snapdealData[getIndex(snapdealData,getMin(snapdealData))+1]['productPrice']:'Not available in Snapdeal';

        var paytmProductName = paytmData.length>0?paytmData[getIndex(paytmData,getMin(paytmData))+1]['productName']:'Not available in Paytm';
        var paytmProductURL = paytmData.length>0?paytmData[getIndex(paytmData,getMin(paytmData))+1]['productURL']:'Not available in Paytm';
        var paytmProductPrice = paytmData.length>0?paytmData[getIndex(paytmData,getMin(paytmData))+1]['productPrice']:'Not available in Paytm';

        var comData = '\n -----MIN PRICE BY PRODUCT-----'+
                      '\n ---Flipkart---'+
                      ',\n Product Name: '+flipkartProductName+
                      ',\n Product URL: '+flipkartProductURL+
                      ',\n Product Price: '+flipkartProductPrice+
                      '\n ---Snapdeal---'+
                      ',\n Product Name: '+snapdealProductName+
                      ',\n Product URL: '+snapdealProductURL+
                      ',\n Product Price: '+snapdealProductPrice+
                      '\n ---Paytm---'+
                      ',\n Product Name: '+paytmProductName+
                      ',\n Product URL: '+paytmProductURL+
                      ',\n Product Price: '+paytmProductPrice;

        fs.writeFile('data/camputeData.txt', comData.toString(), function (err) {
          if (err) throw err;
          console.log('camputeData.csv saved!');
        });

        cdCamputeData(null,{'flipkart min price':flipkartData.length>0?flipkartData[getIndex(flipkartData,getMin(flipkartData))+1]['productPrice']:'0','snapdeal min price':snapdealData.length>0?snapdealData[getIndex(snapdealData,getMin(snapdealData))+1]['productPrice']:'0','Paytm min price':paytmData.length>0?paytmData[getIndex(paytmData,getMin(paytmData))+1]['productPrice']:'0'});
      }


    async.waterfall([
        getProductFromFlipkart,
        getProductFromSnapdeal,
        getProductFromPaytm,
        getProductFromAmazon,
        camputeData
    ], function (err, result) {

        if (err) {
            console.error('error:', err);
            var response = {
                status: 400,
                error: err.message ? err.message : err
            };
            return JSON.stringify(response);
        }
        console.error('result:', result);
        return result;

    });


});


app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(publicDir));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

console.log("Server showing %s listening at http://%s:%s", publicDir, hostname, port);
app.listen(port);

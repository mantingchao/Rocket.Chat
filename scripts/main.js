// Description:
//    An example script, tells you the time. See below on how documentation works.
//    https://github.com/hubotio/hubot/blob/master/docs/scripting.md#documenting-scripts
// 
// Description:
//    An example script, tells you the time. See below on how documentation works.
//    https://github.com/hubotio/hubot/blob/master/docs/scripting.md#documenting-scripts
// 
// Commands:
//    myhubot what time is it? - Tells you the time
//    myhubot what's the time? - Tells you the time
//    myhubot tsmc - Tells you tsmc website

// var MongoClient = require('npm install mongodb --save').MongoClient;

module.exports = (robot) => {

  // MongoClient.connect(process.env.MONGODB_URL, function (err, db) {
  //   if(err) throw err;
  //   //Write databse Insert/Update/Query code here..
  //   console.log('mongodb is running!');
  //   db.close(); //關閉連線
  // }); 

  robot.hear(/(hi)/i, (res) => {
    res.send(`hello~~~${res.message.user.name}`)
  })

  robot.respond(/(what time is it|what's the time)/gi, (res) => {
    const d = new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'})
    //const t = `${d.getHours()}:${d.getMinutes()} and ${d.getSeconds()} seconds`
    res.reply(`It's ${d}`)
  })

  robot.hear(/(tsmc)/i,(res) => {
    res.send('官網在這喔～\nhttps://www.tsmc.com/chinese')
  })

  robot.hear(/(tsmc logo)/i,(res) => {
    res.send('https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Tsmc.svg/1200px-Tsmc.svg.png')
  })
  
  // sent to 指定 room
  robot.hear(/(hello world)/i, (res) => {
    room = "tsmc"
    robot.messageRoom(room, "Just test!")
    res.reply("test1\ntest2~~")
  })

  robot.respond(/check (.*)/, function(response){
    var content = response.match[1];
    if(content.indexOf('http')<0){
        return response.send('不是一個正確的網址喔，請重新輸入？');
    }
    // console.log('content',content)
    robot.http(content).get()(function(err, res, body){
        if(err){
            return response.send(err);
        }
        response.send(res.statusCode);
        response.send('body=',body);
    })
  });
 
  robot.respond(/test/, function(response){
    robot.http('https://express-hubot.herokuapp.com').get()(function(err, res, body){
      if(err){
          return response.send(err);
      }
      console.log('here')
      response.send(res.statusCode);
      response.send('body=',body);
    })
  })


  robot.respond(/testtest/, function(response){
    robot.http('https://www.tsmc.com/chinese').get()(function(err, res, body){
      if(err){
        return response.send(err);
      }
      response.send(res.statusCode+'\n'+body);
    })
  })

  // robot.hear(/(hahaha)/,(res) => {
  //   robot.router.get('/hubot/haha', (req, res) => {
  //     res.send('ok')
  //   })
  // })


  // redis
  var BRAIN_KEY = ['todo','notes'];
  for (var i = 0; i < BRAIN_KEY.length; i++) {
    robot.brain.set(BRAIN_KEY[i])
  }

  // var BRAIN_KEY = 'todo';

  robot.hear(/^check todo\s*$/i, (res) => {
    console.log('brain user',res.message.user.name)
    var tasks = robot.brain.get(BRAIN_KEY[0]) || [];
    if (tasks.length === 0) {
      res.send('todo: no item');
    } else {
      res.send('-----Todo List-----\n' + tasks.map(function(task, idx) {
        return  "[" +idx + '] "' + task + '"';
      }).join('\n'));
    }
  });

  robot.hear(/^add todo:\s+(.*)$/i, (res) => {
    const d = new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'})
    var task = res.match[1] + ` | user: ${res.message.user.name} | create time: ${d}`;
    var tasks = robot.brain.get(BRAIN_KEY[0]) || [];
    tasks.push(task);
    robot.brain.set(BRAIN_KEY[0], tasks);
    var idx = tasks.length - 1;
    res.send('todo: [' + idx + '] "' + task + '" added');
    res.send('-----Todo List-----\n' + tasks.map(function(task, idx) {
      return  "[" +idx + '] "' + task + '"';
    }).join('\n'));
  });

  robot.hear(/^done todo:\s+(\d+)$/i, (res) => {
    var idx = parseInt(res.match[1], 10);
    var tasks = robot.brain.get(BRAIN_KEY[0]) || [];
    var removed = tasks.splice(idx, 1);
    if (removed.length > 0) {
      var task = removed[0];
      res.send('todo: [' + idx + '] "' + task + '" removed');
      res.send('-----Todo List-----\n' + tasks.map(function(task, idx) {
        return  "[" +idx + '] "' + task + '"';
      }).join('\n'));
    }else{
      res.send('todo: no item');
    }
  });

  // var BRAIN_KEY2 = 'notes';
  robot.hear(/^check notes\s*$/i, (res) => {
    console.log('brain user',res.message.user.name)
    var tasks = robot.brain.get(BRAIN_KEY[1]) || [];
    if (tasks.length === 0) {
      res.send('notes: no item');
    } else {
      res.send('-----Notes-----\n' + tasks.map(function(task, idx) {
        return  "[" +idx + '] "' + task + '"';
      }).join('\n'));
    }
  });

  robot.hear(/^add notes:\s+(.*)$/i, (res) => {
    console.log('robot.brain'+robot.brain)
    const d = new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'})
    var task = res.match[1] + ` | user: ${res.message.user.name} | create time: ${d}`;
    var tasks = robot.brain.get(BRAIN_KEY[1]) || [];
    tasks.push(task);
    robot.brain.set(BRAIN_KEY[1], tasks);
    var idx = tasks.length - 1;
    // res.send('notes: [' + idx + '] "' + task + '" added');
    res.send('-----Notes-----\n' + tasks.map(function(task, idx) {
      return  "[" +idx + '] "' + task + '"';
    }).join('\n'));
  });
      
  
  robot.hear(/(Redis List)/i,(res) => {
    for (var i = 0; i < BRAIN_KEY.length; i++) {
      var tasks = robot.brain.get(BRAIN_KEY)
      if(tasks == null){
        res.send(BRAIN_KEY[i] + ': No item')
      }else{
        res.send(BRAIN_KEY[i] + " : "+ tasks.map(function(task, idx) {
          return  "[" +idx + '] "' + task + '"';
        }).join('\n'));
      }
    }   
  })

  // // enter, leave (doesn't work)
  // robot.enter((res) => {
  //   res.send(res.random,enterReplies)
  // })

  // robot.leave((res) => {
  //   res.send(res.random,leaveReplies)
  // })

  // // topic (doesn't work)
  // robot.topic((res) => {
  //   res.send("#{res.message.text}? That's a Paddlin'")
  // })

  // listen
  // robot.listen(
  //   (message) => {
  //     return unless(message.text)
  //   })
  //   message.user.name = "mtchaoa" && (Math.random() > 0.8)
  //   ((respond) => {
  //     response.reply(`HI STEVE! YOU'RE MY BEST FRIEND! (but only like ${response.match * 100}% of the time)`)
  // })

}
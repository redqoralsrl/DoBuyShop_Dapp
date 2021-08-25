const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const engines = require('consolidate');
const multer = require('multer');
const multiparty = require('multiparty');
const fs = require('fs');

// const storage  = multer.diskStorage({ // 2
//   destination(req, file, cb) {
//     cb(null, 'uploadedFiles/');
//   },
//   filename(req, file, cb) {
//     cb(null, `${file.originalname}`);
//   },
// });
// const upload = multer({dest : "public/images/"});
// var uploadWithOriginalFilename = multer({ storage: storage });

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'build/contracts')));

app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/market', function(req, res, next) {
  res.render('market');
});

app.get('/mypage', function(req, res, next) {
  res.render('mypage');
});

app.post('/upload', function(req, res, next) {
  // var form = new multiparty.Form({
  //   autoFiles: false, // 요청이 들어오면 파일을 자동으로 저장할 것인가
  //   uploadDir: 'public/images/', // 파일이 저장되는 경로(프로젝트 내의 temp 폴더에 저장됩니다.)
  //   maxFilesSize: 1024 * 1024 * 5 // 허용 파일 사이즈 최대치
  // });

  // form.parse(req, function (error, fields, files) {
  //   // 파일 전송이 요청되면 이곳으로 온다.
  //   // 에러와 필드 정보, 파일 객체가 넘어온다.
  //   var path = files.fileInput[0].path;
  //   console.log(path);
  //   res.send(path); // 파일과 예외 처리를 한 뒤 브라우저로 응답해준다.
  // });
  /////////////
  // var form = new multiparty.Form();
  // form.on('field', function(name, value){
  //   console.log(name, ' : ', value);
  // });
  // form.on('part', function(part) {
  //   var filename;
  //   var size;
  //   if(part.filename) {
  //     filename = part.filename;
  //     size = part.size;
  //   }else {
  //     part.resume();
  //   }

  //   console.log("Write Streaming file : " + filename);
  //   var writeStream = fs.createWriteStream('/public/images/'+filename);
  //   writeStream.filename = filename;
  //   part.pipe(writeStream);

  //   part.on('data',function(chunk){
  //     console.log(filename+' read '+chunk.length + 'bytes');
  //   });
  //   part.on('end',function(){
  //         console.log(filename+' Part read complete');
  //         writeStream.end();
  //   });
  // });
  // form.on('close',function(){
  //   res.status(200).send('Upload complete');
  // });
  // form.on('progress',function(byteRead,byteExpected){
  //   console.log(' Reading total  '+byteRead+'/'+byteExpected);
  // });
  // form.parse(req);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

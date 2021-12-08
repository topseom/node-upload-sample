function handleFileData(option,callback,error){
    let input = document.getElementById('input-file');
    let progress = document.getElementById('progress-bar');
    let alert = document.getElementById('alert');
    let total_number = document.getElementById('total-loading');
    let btn_console = document.getElementById('btn-console');
    if(input && progress){
        btn_console.onclick = function(){};
        btn_console.classList.add('d-none');
        progress.style.width = null;
        alert.innerHTML = null;
        total_number.innerHTML = null;
        alert.className = "alert";
        progress.className = "progress-bar progress-bar-striped progress-bar-animated";
        input.click();
        input.onchange = function(){
            if(!input.files[0]) return error('not found');
            let formData = new FormData();
            formData.append("userfiles",input.files[0]);
            return callback({ file:input.files[0],formData,progress,alert,total_number,btn_console });
        }
    }else{
        return error('not found');
    }
}
document.getElementById('btn-uploader').onclick = function(){
    handleFileData({ type:"normal" },function({ formData,progress,alert,total_number }){
        axios.post("upload",formData,{
            headers:{
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: function(e){
                const {loaded, total} = e;
                total_number.innerHTML = loaded+"/ "+total+" Bytes";
                if (e.lengthComputable) {
                    let percent = loaded / total * 80;
                    progress.style.width = percent+"%";
                }
            }
        }).then(function(response){
            let data = response['data'];
            progress.classList.add("bg-success");
            progress.style.width = "100%";
            alert.innerHTML = "Upload success! at "+data.path;
            alert.classList.add("alert-primary");
        }).catch(function(err){
            progress.classList.add("bg-danger");
            alert.innerHTML = "Upload Error!";
            alert.classList.add("alert-danger");
        })
    },function(err){});
};

document.getElementById('btn-uploader-tus').onclick = function(){
    handleFileData({ type:"tus" },function({ file,progress,alert,total_number,btn_console }){
        let upload = new tus.Upload(file, {
            endpoint: baseUrl+"/tus/",
            retryDelays: [0, 3000, 5000, 10000, 20000],
            metadata: {
                filename: file.name,
                filetype: file.type
            },
            onBeforeRequest: function(){
                btn_console.classList.remove('d-none');
                let start = true;
                btn_console.onclick = function(){
                    if(start){
                        upload.abort();
                        btn_console.innerHTML = "Resume";
                    }else{
                        upload.findPreviousUploads().then(function (previousUploads) {
                            if (previousUploads.length) {
                                upload.resumeFromPreviousUpload(previousUploads[0])
                            }
                            upload.start();
                            btn_console.innerHTML = "Stop";
                        }).catch(function(err){});
                    }
                    start = !start;
                }
            },
            onError: function(error) {
                progress.classList.add("bg-danger");
                alert.innerHTML = "Upload Error!";
                alert.classList.add("alert-danger");
                btn_console.classList.add('d-none');
            },
            onProgress: function(bytesUploaded, bytesTotal) {
                let percent = (bytesUploaded / bytesTotal * 100).toFixed(2);
                total_number.innerHTML = bytesUploaded+"/ "+bytesTotal+" Bytes";
                progress.style.width = percent+"%";
            },
            onSuccess: function() {
                progress.classList.add("bg-success");
                progress.style.width = "100%";
                alert.innerHTML = "Upload success! at "+upload.url;
                alert.classList.add("alert-primary");
                btn_console.classList.add('d-none');
            }
        });
        upload.start();
    },function(err){})
};
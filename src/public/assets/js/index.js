var handleFileData = function(callback,error){
    let input = document.getElementById('input-file');
    let progress = document.getElementById('progress-bar');
    let alert = document.getElementById('alert');
    if(input && progress){
        progress.style.width = null;
        alert.innerHTML = null;
        alert.className = "alert";
        progress.className = "progress-bar progress-bar-striped progress-bar-animated";
        input.click();
        input.onchange = function(){
            if(!input.files[0]) return error('not found');
            let formData = new FormData();
            formData.append("userfiles",input.files[0]);
            return callback({ file:input.files[0],formData,progress,alert });
        }
    }else{
        return error('not found');
    }
}
document.getElementById('btn-uploader').onclick = function(){
    handleFileData(function({ formData,progress,alert }){
        axios.post("upload",formData,{
            headers:{
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: function(e){
                const {loaded, total} = e;
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
    handleFileData(function({ file,progress,alert }){
        let upload = new tus.Upload(file, {
            endpoint: "http://localhost:3000/tus/",
            retryDelays: [0, 3000, 5000, 10000, 20000],
            metadata: {
                filename: file.name,
                filetype: file.type
            },
            onError: function(error) {
                progress.classList.add("bg-danger");
                alert.innerHTML = "Upload Error!";
                alert.classList.add("alert-danger");
            },
            onProgress: function(bytesUploaded, bytesTotal) {
                let percent = (bytesUploaded / bytesTotal * 100).toFixed(2);
                progress.style.width = percent+"%";
            },
            onSuccess: function() {
                progress.classList.add("bg-success");
                progress.style.width = "100%";
                alert.innerHTML = "Upload success! at "+upload.url;
                alert.classList.add("alert-primary");
            }
        });
        upload.findPreviousUploads().then(function (previousUploads) {
            if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0])
            }
            upload.start()
        });
    },function(err){})
};
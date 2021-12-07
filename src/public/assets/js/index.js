document.getElementById('btn-uploader').onclick = function(){
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
            if(!input.files[0]) return true;
            let formData = new FormData();
            formData.append("userfiles",input.files[0]);
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
        }
    }
};
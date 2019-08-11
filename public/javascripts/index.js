function openInNewTab(url) {
    window.open(url, '_blank');
}

function get_defaultData(callback,errorcall){
    $.get('/getPDF/defaults',(req,err)=>{
        if (err) {
            callback(req)
        }
        else{
            errorcall(err)
        }
    })
}

$(document).ready(()=>{
    get_defaultData((data)=>{
        data.storeTypes.forEach((type)=>{
            $('#store-type>select').append(`<option value = "${type}">${type}</option>`) ;
        });
        data.CUCMGroup.forEach((type)=>{
            $('#manager-group>select').append(`<option value = "${type}">${type}</option>`) ;
        });
        data.region.forEach((type)=>{
            $('#region>select').append(`<option value = "${type}">${type}</option>`) ;
        });
        data.MRGList.forEach((type)=>{
            $('#media-group>select').append(`<option value = "${type}">${type}</option>`) ;
        });
        data.CUCMNodes.forEach((type)=>{
            $('#store-CUCMNode>select').append(`<option value = "${type}">${type}</option>`) ;
        });
        data.Extension.forEach((type)=>{
            $('#party-mask>select').append(`<option value = "${type}">${type}</option>`) ;
        });
    },(err)=>{
        console.log(err)
    })
});

function getSubmitData(){
    data = {
        storeNo:$('#store-no>input').val(),
        storeName:$('#store-name>input').val(),
        storeType:$('#store-type>select').val(),
        storeAddress:$('#store-address>input').val(),
        storeCUCMNode:$('#store-CUCMNode>select').val(),
        phoneNumber:$('#phone-number>input').val(),
        managerGroup:$('#manager-group>select').val(),
        region:$('#region>select').val(),
        mediaGroup:$('#media-group>select').val(),
        partyMask:$('#party-mask>select').val(),
        translationPattern:$('#translation-pattern>input').val()
    };
    data.storeCode = `${data.storeNo}-${data.storeType}-${data.storeName}-`;
    return data;
}

function submitData(){
    const data = getSubmitData();
    for(key in data){
        console.log(key,data[key])
        if(data[key] === ''){
            $('#error').attr('hidden',false);
            return;
        }
    }
    $('#error').attr('hidden',true);

    $.post('/getPDF',data,(req,err)=>{
        setTimeout(()=> {
            openInNewTab(req)
        },3000);
    })
}

$('#submit').click(submitData);
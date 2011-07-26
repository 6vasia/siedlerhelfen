
function expand(obj_id){
    var obj = document.getElementById(obj_id);
    if (obj.style.display === 'none'){
        obj.style.display = 'block';
    }
    else {
        obj.style.display = 'none';
    }
}

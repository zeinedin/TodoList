 //!Date function
 module.exports.getDate = () =>{
 let today = new Date();

 let options = {
   weekday: "long",
   day: "numeric",
   month: "long"
 };
  return today.toLocaleDateString("en-Us", options);
}


exports.getDay = () =>{
    let today = new Date();
    let options = {
      weekday: "long",
    };
    let day = today.toLocaleDateString("en-Us", options);
    return day;
   }
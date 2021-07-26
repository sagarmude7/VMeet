import { makeStyles } from '@material-ui/core';

const styles = makeStyles((theme) => ({
    root : {
      margin:"0 !important",
      padidng:"0 !important",
      width:"0",
      display:"none !important"
    },
    btn:{
      color: "white",
      backgroundColor: "#1a73e8",
      padding: "14px 20px ",
      borderRadius: "30px",
      margin:"5px",
      boxShadow:"1px 0px 10px grey",
      "&:hover": {
        backgroundColor: 'blue'
      }
    },
    icon:{
      color:"white !important",
      fontSize:"28px",
    },
    iconBg:{
        width:"50px",
        borderRadius:"50%",
        border:"1px solid black",
        padding:"10px",
        backgroundColor :"#f44336",
        "&:hover": {
          backgroundColor: '#f44336'
        },
        
    },

    video1: {

      width: '650px',
      height:"500px",
      borderRadius: "30px !important",
  
      // [theme.breakpoints.down('xs')]: {
      //   width: '300px',
      // },
      // [theme.breakpoints.down('md')]: {
      //   width: '650px',
         
      // },
    },
    video2: {
      width: "0",
      display:"none"
    },
  
    offvideo: {
      width: '100%',
      height: "60vh",
  
    },
    video :{
      padding:"100px 100px",
      
    },
    gridContainer: {
      // margin: "100px 20px 10px 0px",  
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
      },
    },
    paper: {
      border: '2px solid black',
      borderRadius: "10px",
    },
    actionBtns: {
      marginTop:"-85px",
      // marginLeft:"320px",
      display: "flex",
      width: "655px",
      height: "auto",
      color: "white",
      justifyContent: "center",
      [theme.breakpoints.down('md')]: {
        width: "960px",
      },
      [theme.breakpoints.down('sm')]: {
        width: "960px",
      },
      [theme.breakpoints.down('xs')]: {
        width: "970px",
      },
      
  
    },
    readyToJoin : {
      fontSize : "30px",
      fontWeight : "200",
      letterSpacing : "2px",
    },
    readyToJoinTxt : {
      fontSize : "22px",
      fontWeight : "400",
      letterSpacing : "1px",
    },
    descText:{
     paddingLeft:"100px ",
     marginLeft:"20px",
      borderRadius: "20px",
      fontSize:"15px  !important",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      [theme.breakpoints.down('sm')]: {
          width:"100%",
          position:"absolute",
          // paddingLeft:"100px ",
          // marginLeft:"200px",
          top:"550px",
          left:"120px",
          
      },
      [theme.breakpoints.down('xs')]: {
        width:"100%",
        position:"absolute",
        top:"480px",
        padding:"0px",
        left:"410px",
        marginTop : " 0px",
      },
    },
    camOff :{
        width:"650px",
        height:"390px",
      // background: " #696969",
       background: " #545454",
      borderRadius: "20px",

      // background: "-webkit-linear-gradient(to right, #ffefba, #ffffff)",  
      // background: "linear-gradient(to right, #ffefba, #ffffff)", 
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        marginLeft:"200px !important",
        border:"2px solid red",

        width:"550px",
        height:"40vh" ,

      },
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        marginRight:"0px !important",
     
        width:"550px",
        height:"40vh" ,
        padding:"0",

      },
      [theme.breakpoints.down('xs ')]: {
        flexDirection: 'column',
        marginRight:"0px !important",
     
        width:"550px",
        height:"40vh" ,
        padding:"0",

      },
    },
      camOffText:{
        textAlign: "center",
        paddingTop:"150px",
        fontSize:"30px !important",
        letterSpacing:"4px",
        color: "white",
        // display:"flex",
        // flexDirection:"column",
        // alignItems:"center",
        [theme.breakpoints.down('md')]: {
       
          paddingTop:"100px",
        },
        [theme.breakpoints.down('sm')]: {
          paddingTop:"100px",
  
        },
        // justifyContent:"center",
      }
  }));
  

export default styles;
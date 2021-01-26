const main =(args)=>{

	args.forEach((i)=>{
		if(i === "--help"){
			console.log("visit our web https://lightcompiler.com");
		}
	});
}

if(require.main === module){
	main(process.argv.slice(2,process.argv.length));
}

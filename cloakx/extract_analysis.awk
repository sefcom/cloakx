BEGIN{
  cur_id="";
  skip=0;
  total=0;
  anal=0;
  excep=0;
  timeout=0;
  js_files=0;
  complete=0;
  quad1=0;
  quad2=0;
  quad3=0;
  noexceps=0;
  num_anal=0;
}
{
  js_files++;
  if ($4=="Analysis") {
      skip+= $26;
      anal+=$24;
      total+=$28;

  }
  if ($4=="Exception"){
      excep+=1;
  }
  if ($5=="Timedout"){
      printf("%s TIMEOUT\n",cur_id);
      timeout+=1;
  }
 
  if (cur_id != $1) {
      num_anal++;
    if (total==0){
      perc=0;
      printf "%s Excep:%d TO:%d FileCnt:%d  ---> NONE \n", cur_id, excep, timeout, js_files
    
    } else {
      perc=((anal+1)/(total+1)*100)
      if (excep==0 && timeout==0){
	  noexceps++;
      }
      if (excep==0 && timeout==0 && total==anal && total > 0){
	  complete++;
	  printf "%s ***PERFECT*** Excep:%d TO:%d FileCnt:%d  ---> Analysis:%d (%.2f) Skip:%d Total:%d \n", cur_id, excep, timeout, js_files, anal, perc, skip, total 
      } else{
	  
          printf "%s Excep:%d TO:%d FileCnt:%d  ---> Analysis:%d (%.2f) Skip:%d Total:%d \n", cur_id, excep, timeout, js_files, anal, perc, skip, total 
      }
    }
    
    cur_id=$1;
    skip=0;
     total=0;
         anal=0;
      excep=0;
      timeout=0;
      js_files=0;
   }
}
END{
    printf "No Exceptions %d (%.2f)\n", noexceps, noexceps/num_anal*100
    printf "Total Completely Analyzed %d (%.2f) \n ", complete, complete/num_anal*100
    print "Total Considered " num_anal
}


#!/usr/bin/env bash
while getopts u:a:f: flag
do
    case "${flag}" in
        f) dir=${OPTARG};;
    esac
done

arg=$1
workdir=($(echo ${dir:=./projects/azlabs}))
version=($(echo ${arg:=patch}))

dirs=( $( ls -1p $workdir | grep / | sed 's/^\(.*\)/\1/') )
cwd=($(pwd))

for dir in ${dirs[@]}; do
  current_dir="${cwd}/projects/azlabs/${dir}"
  echo $current_dir
  cd "$current_dir" && npm version $version
done

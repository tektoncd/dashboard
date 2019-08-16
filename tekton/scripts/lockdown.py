#!/usr/bin/env python

"""
lockdown.py updates release.yaml files

This script does:
* Parses those external image and adds sha value to them in
  the release.yaml file
"""

import argparse
import os
import re
import string
import sys
import docker
from typing import List

def scan_release(omit: List[str], path: str) -> List[str]:
    """Extracts built images from the release.yaml at path
    Args:
        omit: The list of images that are omitted from the static image list
        path: The path to the file (release.yaml) that will contain the built images
    Returns:
        list of the images parsed from the file
    """
    print("scan_release")
    images = []
    with open(path) as f:
        for line in f:
            match = re.search("image:" + ".*" + "latest", line)
            if match:
                exclude = False
                for image in omit:
                    if image in line:
                        exclude = True
                if not(exclude):
                    images.append(match.group(0).replace("image:", "").strip())
    return images

def lockdown_image(images: List[str]) -> List[str]:
    """Lockdown images with the sha value
    Args:
        images: The list of images that are lockdowned
    Returns:
        list of the lockdowned images
    """
    print("lockdown_image")
    taggedimages = []
    client = docker.DockerClient(base_url='unix://var/run/docker.sock')
    for image in  images:
      print("image:" + image)
      imageobj = client.images.pull(image)
      taggedimages.append(imageobj.attrs["RepoDigests"][0])
    return taggedimages

def replace_images(org: List[str], new: List[str], path: str):
    """Replace original images wiht new images in the release.yaml at path
    Args:
        org: The list of original images that are replaced by the new images
        new: The list of new images 
        path: The path to the file (release.yaml) that will contain the built images
    """
    print("replace_image")
    with open(path) as f:
        with open(path+".temp", "x") as ff:
            for line in f:
                newline = line
                i = 0
                for o in org:
                   match = re.search(o , line)
                   if match:
                        newline = line.replace(o, new[i])
                   i = i + 1
                ff.write(newline)
    os.replace(path+".temp", path)

if __name__ == "__main__":
    arg_parser = argparse.ArgumentParser(
        description="Lockdown external images with sha in a release.yaml")
    arg_parser.add_argument("--path", type=str, required=True,
                            help="Path to the release.yaml")
    arg_parser.add_argument("--omit", type=str, required=True,
                            help="String prefix which is omitted from the external images")
    args = arg_parser.parse_args()

    images = scan_release(args.omit.split(",") , args.path)
    taggedimages = lockdown_image(images)
    replace_images(images, taggedimages, args.path)

    print("\nDone.")


import os
from os.path import join, getsize

nom_dossier = 'bruxelles'
sortie = open('sortie.html', 'w')

for root, dirs, files in os.walk('../voyages/images/'+nom_dossier, topdown=True):
    files.sort()
    # print(files[:5])
    for fichier in files :
        sortie.write('<a href="../images/'+ nom_dossier +'/'+ fichier +'" data-lightbox="roadtrip"><img src="../images/'+ nom_dossier +'/'+ fichier +'" alt="" height="auto" width="30%"/></a>'+'\n')

    # print(root, "consumes", end=" ")
    # print(sum(getsize(join(root, name)) for name in files), end=" ")
    # print("bytes in", len(files), "non-directory files")
    # if 'CVS' in dirs:
    #     dirs.remove('CVS')  # don't visit CVS directories

sortie.close()
from email.mime import audio
import time
from pytube import YouTube
import os

# https://www.geeksforgeeks.org/pytube-python-library-download-youtube-videos/
# https://www.geeksforgeeks.org/download-video-in-mp3-format-using-pytube/
# https://dev.to/jimajs/how-to-convert-mp4-to-mp3-using-python-1dcf
# https://pytube.io/en/latest/api.html
#


url = "https://youtu.be/g1TYOwPt4oE?si=nI7yL9vFl23e6QxF"
url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
urls = [url]
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By


def descargar_videos(urls, manual_name=False):
    driver = webdriver.Chrome()
    for url in urls:
        if url:
            try:
                driver.get(url)
                time.sleep(5)
                try:
                    driver.find_element(
                        by=By.XPATH,
                        value="/html/body/ytd-app/ytd-consent-bump-v2-lightbox/tp-yt-paper-dialog/div[4]/div[2]/div[6]/div[1]/ytd-button-renderer[1]/yt-button-shape/button/yt-touch-feedback-shape/div/div[2]",
                    ).click()
                except Exception:
                    pass

                driver.find_element(
                    by=By.XPATH,
                    value="/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[2]/ytd-watch-metadata/div/div[4]/div[1]/div/ytd-text-inline-expander/tp-yt-paper-button[1]",
                ).click()

                html = driver.page_source

                soup = BeautifulSoup(html, features="html.parser")

                try:
                    song_title = soup.find(
                        "h3", attrs={"class": "yt-video-attribute-view-model__title"}
                    ).text
                except:
                    if not manual_name:
                        raise Exception
                    print("\tNo se ha podido sacar el nombre de la canción")
                    song_title = input(f"\tIntroduzca nombre de la canción {url} : ")

                try:
                    author_name = soup.find(
                        "h4", attrs={"class": "yt-video-attribute-view-model__subtitle"}
                    ).text
                except:
                    if not manual_name:
                        raise Exception
                    print("\tNo se ha podido sacar el nombre del autor")
                    author_name = input(f"\tIntroduzca nombre del autor {url} : ")

                audio_file_name = f"{author_name} - {song_title}.mp3"
                for c in ["'", '"', "/", "\\"]:
                    audio_file_name = audio_file_name.replace(c, "")

                yt = YouTube(url)
                video = yt.streams.filter(only_audio=True).first()
                out_file = video.download(output_path="./videos_descargados")
                os.makedirs("audios/descargas_automaticas/", exist_ok=True)
                print("Procesada", audio_file_name)
                os.rename(out_file, f"audios/descargas_automaticas/{audio_file_name}")

            except Exception as e:
                print(f"Ha fallado descargando {url} por {e}")

    driver.quit()


if __name__ == "__main__":

    with open("music_downloader/musiquita.txt", "r") as fh:
        urls = fh.read().split("\n")

    descargar_videos(urls, True)

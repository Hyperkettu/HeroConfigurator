
import $ from 'jquery';
import { Hero } from  '../../server/src/data';
import { config } from '../../server/src/environment/config/config'
import { Routes } from '../../server/src/controllers/routes';
import { UpdateResponse }  from '../../server/src/packet';

export function getBackendUrl(path: string): string {
  //  return `http://${config.serverAddress}:${config.serverPort}${path}`;
  return path;
}

export class Application {


    constructor() {
        $('#add-hero-button').on('click', () => {
            this.addHero();
        });
    }

     debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
        return function(this: any, ...args: Parameters<T>) {
            if (timeoutId) {
            clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
            func.apply(this, args);
            }, delay);
        };

    }

     protected ajaxCall(url: string, method: 'POST' | 'GET', sendData: any, successCallback: (data: any) => void,  errorCallback: (data: any) => void) {
        if(sendData != null && sendData !== undefined && method === 'POST') {
            const settings: JQuery.AjaxSettings<any> = {
              method,
              data: JSON.stringify({data: sendData}),
              url,
              contentType: "application/json; charset=UTF-8",
              headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
              success: (data: any, status: any, xhr: any) => {
                successCallback(data);
              },
              error: (err: any) =>  {
                  console.log('error', err);
                  errorCallback(err);
              },
              crossDomain: true,
              dataType: 'json'
            };
    
          $.ajax(settings);
        } else {
          $.ajax({
            url,
            method, 
            dataType: 'json', 
            success: (data) => {
              successCallback(data);
            },
            error: (xhr, status, error) => {
                errorCallback(error);
            }
          });
        } 
    }

    public getHeroesFromServer() {
      const promise = new Promise<any | null>((resolve, reject) => {
        this.ajaxCall(`${getBackendUrl(Routes.GET_HEROES)}`, 'GET', null, data => {
          if(data != null) {
            console.log('Data fetched successfully', data);
             resolve(data);
          } else {
            console.log('Server error, fetched data null.');
            resolve(null);
          }
        }, data => {
          console.error('Error fetching data:', data);
          resolve(null);
        });
      });
  
      return promise;
    }


    async init() {
        const response = await this.getHeroesFromServer() as UpdateResponse;

        if(!response || response.status !== 'success') {
            return;
        }

        const heroes = response.payload as Hero[];

        this.listHeroes(heroes);
    }

    listHeroes(heroes: Hero[]): void {
        const heroList = $('#hero-list');
        heroList.empty();

        let innerHTML = '';

        for(const hero of heroes) {
            innerHTML += this.getHeroHTMLString(hero);
        }

        heroList.html(innerHTML);

        for(const hero of heroes) {
            const removeButtonId = `remove-hero-button-${hero.id}`;
            $(`#${removeButtonId}`).on('click', () => {
                this.removeHero(hero);
            });

            this.addInputFieldChangedHandler(`name-input-${hero.id}`, value => {
                hero.name = value;
                this.updateHero(hero);
            });
            this.addInputFieldChangedHandler(`attack-input-${hero.id}`, value => {
                const val = Number(value);

                if(Number.isNaN(val)) {
                    return;
                }

                hero.attack = val;

                this.updateHero(hero);
            });
            this.addInputFieldChangedHandler(`defense-input-${hero.id}`, value => {
                const val = Number(value);

                if(Number.isNaN(val)) {
                    return;
                }

                hero.defense = val;
                this.updateHero(hero);
            });
            this.addInputFieldChangedHandler(`special-skill-id-input-${hero.id}`, value => {
                hero.specialSkillId = value;
                this.updateHero(hero);
            });
        }
    }

    async removeHero(hero: Hero) {
        const removeResponse = await this.sendHeroToServer(hero, Routes.REMOVE_HERO) as UpdateResponse;
        if(!removeResponse || removeResponse.status !== 'success') {
            return;
        }
        const response = await this.getHeroesFromServer() as UpdateResponse;
        if(!response || response.status !== 'success') {
            return;
        }
        this.listHeroes(response.payload as Hero[]);
    }

    async updateHero(hero: Hero) {
        const updateResponse = await this.sendHeroToServer(hero, Routes.UPDATE_HERO) as UpdateResponse;
        if(!updateResponse || updateResponse.status !== 'success') {
            return;
        }
        const response = await this.getHeroesFromServer() as UpdateResponse;
        if(!response || response.status !== 'success') {
            return;
        }
        this.listHeroes(response.payload as Hero[]);
    }

    addInputFieldChangedHandler(inputFieldId: string, handler: (value: string) => void): void {
    const debouncedInputHandler = this.debounce((event: JQuery.TriggeredEvent) => {
        const inputValue = $(event.currentTarget).val() as string;
        handler(inputValue);
    }, 500);

    const field = $(`#${inputFieldId}`);
    
    field.on('input', debouncedInputHandler);
}

    async addHero(): Promise<void> {
        const name = $('#new-name').val() as string;
        const attack = Number($('#new-atk').val());
        const defense = Number($('#new-def').val());
        const specialSkillId = $('#new-skill').val() as string;

        if(name.length === 0) {
            return;
        }

        if(specialSkillId.length === 0) {
            return;
        }
        
        const hero: Hero = {
            name, 
            attack,
            defense,
            specialSkillId
        };

        await this.sendHeroToServer(hero, Routes.ADD_HERO);

       const response = await this.getHeroesFromServer() as UpdateResponse;
       if(!response || response.status  !== 'success') {
            this.listHeroes([]);
            return;
       }

       this.listHeroes(response.payload as Hero[]);
    }

    public sendHeroToServer(hero: Hero, route: string) {
      const promise = new Promise<any | null>((resolve, reject) => {
        this.ajaxCall(`${getBackendUrl(route)}`, 'POST', hero, data => {
          if(data != null) {
            console.log('Data fetched successfully', data);
             resolve(data);
          } else {
            console.log('Server error, fetched data null.');
            resolve(null);
          }
        }, data => {
          console.error('Error fetching data:', data);
          resolve(null);
        });
      });
  
      return promise;
    }

    getHeroHTMLString(hero: Hero): string {
        const html  = `<div class="grid grid-cols-12 gap-gutter px-md py-lg border-b border-white/5 items-center hero-row-glow transition-all duration-300">
        <div class="col-span-3">
        <input id="name-input-${hero.id}" class="bg-surface-container-lowest/50 border border-white/10 text-on-surface font-headline-md text-headline-md px-sm py-xs w-full rounded-lg neon-glow-primary transition-all" type="text" value="${hero.name}"/>
        </div>
        <div class="col-span-2">
        <input id="attack-input-${hero.id}" class="bg-surface-container-lowest/50 border border-white/10 text-primary-fixed-dim font-label-md text-label-md px-sm py-xs w-full rounded-lg text-center focus:border-primary-fixed-dim" type="number" value="${hero.attack}"/>
        </div>
        <div class="col-span-2">
        <input id="defense-input-${hero.id}" class="bg-surface-container-lowest/50 border border-white/10 text-secondary font-label-md text-label-md px-sm py-xs w-full rounded-lg text-center focus:border-secondary" type="number" value="${hero.defense}"/>
        </div>
        <div class="col-span-4">
        <input id="special-skill-id-input-${hero.id}" class="bg-surface-container-lowest/50 border border-white/10 text-tertiary-fixed-dim font-label-md text-label-md px-sm py-xs w-full rounded-lg focus:border-tertiary-fixed-dim" type="text" value="${hero.specialSkillId}"/>
        </div>
        <div class="col-span-1 flex justify-center">
        <button id="remove-hero-button-${hero.id}" class="text-error hover:text-error-container hover:scale-110 transition-all p-xs active:scale-90">
        <span class="material-symbols-outlined">delete</span>
        </button>
        </div>
        </div>
        </div>`;

        return html;
    }
}